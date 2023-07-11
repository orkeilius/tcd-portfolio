
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE FUNCTION "public"."TR_deleteExpiredCode"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  delete from project_code 
  where expire < now();
  return new;
end$$;

ALTER FUNCTION "public"."TR_deleteExpiredCode"() OWNER TO "postgres";

CREATE FUNCTION "public"."TR_deleteFileOnPortfolioDelete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  delete from storage.objects 
  where bucket_id = 'media' and path_tokens[1] = cast (OLD.id as text);
  return OLD;
end$$;

ALTER FUNCTION "public"."TR_deleteFileOnPortfolioDelete"() OWNER TO "postgres";

CREATE FUNCTION "public"."TR_populateUser"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN

  insert into public.user_info ("id","first_name","last_name","role") 
  values (
    new.id,
    new.raw_user_meta_data ->> 'firstName',
    new.raw_user_meta_data ->> 'lastName',
    '2'
  );

  return new;
END$$;

ALTER FUNCTION "public"."TR_populateUser"() OWNER TO "postgres";

CREATE FUNCTION "public"."TR_renameUnamedPortfolio"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  if '' in  (select title from portfolio) then
    update portfolio
    set title = 'untitled portfolio'
    where title = '';
  end if;
  return new;
end$$;

ALTER FUNCTION "public"."TR_renameUnamedPortfolio"() OWNER TO "postgres";

CREATE FUNCTION "public"."TR_renameUnamedProject"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  if '' in  (select name from project) then
    update project
    set name = 'untitled project'
    where name = '';
  end if;
  return new;
end$$;

ALTER FUNCTION "public"."TR_renameUnamedProject"() OWNER TO "postgres";

CREATE FUNCTION "public"."_bugged"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  /*can't remove trigger on http responce table*/
  return null;
end
$$;

ALTER FUNCTION "public"."_bugged"() OWNER TO "postgres";

CREATE FUNCTION "public"."fn_createComment"("arg_portfolio_id" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  if (
    "getUserRole"() = 'professor' 
    and 
    auth.uid() in (
      select user_id from project_user 
      where project_id = (
        select project_id from portfolio 
        where id = arg_portfolio_id)
    ) and
    ( 
      select count(*) from comment
      where portfolio_id = arg_portfolio_id and author_id = auth.uid()
    ) = 0
  ) then
    insert into comment("author_id","portfolio_id","text") 
    values (auth.uid(),arg_portfolio_id,'');  
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;
end$$;

ALTER FUNCTION "public"."fn_createComment"("arg_portfolio_id" integer) OWNER TO "postgres";

CREATE FUNCTION "public"."fn_createParagraph"("portfolio_id" integer) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  newPosition INTEGER;
BEGIN
  if
    auth.uid() = (
      select student_id from portfolio
      where id = portfolio_id
    ) 
   then
    /*get minimal position*/
    newPosition = (select coalesce(MAX(position),0) + 1 from paragraph
          where portfolio = portfolio_id);
    
    insert into paragraph("portfolio","position","title","text") 
    values (portfolio_id,newPosition,'','');
    
    return newPosition;
  end if;

  RAISE EXCEPTION '403 Forbidden';
end$$;

ALTER FUNCTION "public"."fn_createParagraph"("portfolio_id" integer) OWNER TO "postgres";

CREATE FUNCTION "public"."fn_createPortfolio"("arg_project_id" integer) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  newPortfolioID INTEGER;

BEGIN
  if (
    "getUserRole"() = 'student' and 
    auth.uid() in (
      select user_id from project_user 
      where project_id = arg_project_id
    ) and
    ( 
      select count(*) from portfolio
      where project_id = arg_project_id and student_id = auth.uid()
    ) = 0
  ) then
    insert into portfolio("student_id","project_id","title","text") 
    values (auth.uid(),arg_project_id,'','')
    returning id into newPortfolioID;
    
    return newPortfolioID;
    else
        RAISE EXCEPTION '403 Forbidden';
  end if;
end$$;

ALTER FUNCTION "public"."fn_createPortfolio"("arg_project_id" integer) OWNER TO "postgres";

CREATE FUNCTION "public"."fn_createProject"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
  newProjectID integer;
begin
  if ("getUserRole"() = 'professor') then
    insert into project ("name","description") 
      values ('','')
    RETURNING id into newProjectID;

    insert into project_user (project_id,user_id)
      values(newProjectID,auth.uid());
    
    return newProjectID;
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;

end$$;

ALTER FUNCTION "public"."fn_createProject"() OWNER TO "postgres";

CREATE FUNCTION "public"."fn_deleteExpiredCode"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  delete from project_code 
  where expire < now();
end$$;

ALTER FUNCTION "public"."fn_deleteExpiredCode"() OWNER TO "postgres";

CREATE FUNCTION "public"."fn_joinProject"("join_id" integer, "join_code" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  if 
    join_code = (select code from project_code where project_code.id = join_id)
    and
    "getUserRole"() = any( ARRAY['professor','student'])
  then

    insert into project_user (project_id,user_id)
    values(join_id,auth.uid());
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;
end$$;

ALTER FUNCTION "public"."fn_joinProject"("join_id" integer, "join_code" "text") OWNER TO "postgres";

CREATE FUNCTION "public"."fn_kickUser"("arg_user_id" "uuid", "arg_project_id" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  if (
    "getUserRole"() = 'professor' and 
    auth.uid() != arg_user_id and
    auth.uid() in (
      select user_id from project_user 
      where project_id = arg_project_id
    )
  ) then
    delete from project_user 
    where project_id = arg_project_id and user_id = arg_user_id;
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;
end$$;

ALTER FUNCTION "public"."fn_kickUser"("arg_user_id" "uuid", "arg_project_id" integer) OWNER TO "postgres";

CREATE FUNCTION "public"."fn_queryUserList"("query_project_id" integer) RETURNS TABLE("title" "text", "portfolio_id" integer, "first_name" "text", "last_name" "text", "user_id" "uuid", "user_role" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  return query
  select 
    portfolio.title as title, 
    portfolio.id as portfolio_id,
    user_info.first_name as first_name, 
    user_info.last_name as last_name,
    user_info.id as user_id,
    "role".role as user_role
  from project_user
  left join portfolio on project_user.project_id = portfolio.project_id and project_user.user_id = portfolio.student_id
  join user_info on project_user.user_id = user_info.id
  left join "role" on user_info.role = "role".id 
  where project_user.project_id = query_project_id;

END;
$$;

ALTER FUNCTION "public"."fn_queryUserList"("query_project_id" integer) OWNER TO "postgres";

CREATE FUNCTION "public"."fn_searchUser"("arg_search" "text") RETURNS TABLE("first_name" "text", "last_name" "text", "email" character varying, "role" smallint, "id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if ("getUserRole"() = 'admin') then
    return query
    select user_info.first_name, user_info.last_name, auth.users.email, user_info.role, user_info.id
    from user_info
    left join auth.users on user_info.id = auth.users.id
    where user_info.first_name ILIKE '%' || arg_search || '%' OR 
    user_info.last_name ILIKE '%' || arg_search || '%' OR auth.users.email ILIKE '%' || arg_search || '%'
    LIMIT 25;
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;
end
$$;

ALTER FUNCTION "public"."fn_searchUser"("arg_search" "text") OWNER TO "postgres";

CREATE FUNCTION "public"."fn_setRole"("arg_role" integer, "arg_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if ("getUserRole"() = 'admin') then
    UPDATE user_info
    SET role = arg_role
    where id = arg_id;
  else
    RAISE EXCEPTION '403 Forbidden';
  end if;
end
$$;

ALTER FUNCTION "public"."fn_setRole"("arg_role" integer, "arg_id" "uuid") OWNER TO "postgres";

CREATE FUNCTION "public"."fn_userExist"("arg_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
   PERFORM * FROM auth.users
   WHERE email = LOWER(arg_email);

   IF (FOUND) THEN
      RETURN TRUE;
   ELSE
      RETURN FALSE;
  END if;
END;$$;

ALTER FUNCTION "public"."fn_userExist"("arg_email" "text") OWNER TO "postgres";

CREATE FUNCTION "public"."getUserRole"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$declare
	user_role text;
begin
  select role.role into user_role from user_info
  join role on user_info.role = role.id
  where user_info.id = auth.uid() limit 1;
  return user_role;
end$$;

ALTER FUNCTION "public"."getUserRole"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE "public"."comment" (
    "author_id" "uuid" NOT NULL,
    "portfolio_id" integer NOT NULL,
    "text" character varying NOT NULL,
    "id" integer NOT NULL
);

ALTER TABLE "public"."comment" OWNER TO "postgres";

ALTER TABLE "public"."comment" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."comment_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."paragraph" (
    "portfolio" integer NOT NULL,
    "position" integer NOT NULL,
    "title" "text",
    "text" "text",
    "id" integer NOT NULL
);

ALTER TABLE "public"."paragraph" OWNER TO "postgres";

ALTER TABLE "public"."paragraph" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."paragraph_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."portfolio" (
    "id" integer NOT NULL,
    "student_id" "uuid" NOT NULL,
    "project_id" integer NOT NULL,
    "title" "text" NOT NULL,
    "text" "text"
);

ALTER TABLE "public"."portfolio" OWNER TO "postgres";

ALTER TABLE "public"."portfolio" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."portfolio_portfolio_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."project" (
    "id" integer NOT NULL,
    "name" character varying NOT NULL,
    "description" "text"
);

ALTER TABLE "public"."project" OWNER TO "postgres";

CREATE TABLE "public"."project_code" (
    "id" integer NOT NULL,
    "code" "text",
    "expire" timestamp with time zone
);

ALTER TABLE "public"."project_code" OWNER TO "postgres";

ALTER TABLE "public"."project_code" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."project_code_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."project" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."project_project_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."project_user" (
    "project_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."project_user" OWNER TO "postgres";

CREATE TABLE "public"."role" (
    "id" smallint NOT NULL,
    "role" "text"
);

ALTER TABLE "public"."role" OWNER TO "postgres";

ALTER TABLE "public"."role" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."role_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE "public"."user_info" (
    "id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "role" smallint DEFAULT '2'::smallint
);

ALTER TABLE "public"."user_info" OWNER TO "postgres";

ALTER TABLE ONLY "public"."comment"
    ADD CONSTRAINT "comment_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."comment"
    ADD CONSTRAINT "comment_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."paragraph"
    ADD CONSTRAINT "paragraph_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."paragraph"
    ADD CONSTRAINT "paragraph_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."portfolio"
    ADD CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."project_code"
    ADD CONSTRAINT "project_code_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."project"
    ADD CONSTRAINT "project_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."project"
    ADD CONSTRAINT "project_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."project_user"
    ADD CONSTRAINT "project_user_pkey" PRIMARY KEY ("project_id", "user_id");

ALTER TABLE ONLY "public"."role"
    ADD CONSTRAINT "role_pkey1" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_info"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

CREATE TRIGGER "deleteExpiredCode" BEFORE INSERT OR DELETE OR UPDATE ON "public"."project_user" FOR EACH STATEMENT EXECUTE FUNCTION "public"."TR_deleteExpiredCode"();

CREATE TRIGGER "deleteFileOnDelete" BEFORE DELETE ON "public"."paragraph" FOR EACH ROW EXECUTE FUNCTION "public"."TR_deleteFileOnPortfolioDelete"();

CREATE TRIGGER "renameUnamedPortfolio" AFTER INSERT OR UPDATE ON "public"."portfolio" FOR EACH STATEMENT EXECUTE FUNCTION "public"."TR_renameUnamedPortfolio"();

CREATE TRIGGER "renameUnamedProject" AFTER INSERT OR UPDATE ON "public"."project" FOR EACH STATEMENT EXECUTE FUNCTION "public"."TR_renameUnamedProject"();

ALTER TABLE ONLY "public"."comment"
    ADD CONSTRAINT "comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."user_info"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comment"
    ADD CONSTRAINT "comment_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."paragraph"
    ADD CONSTRAINT "paragraph_portfolio_fkey" FOREIGN KEY ("portfolio") REFERENCES "public"."portfolio"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."portfolio"
    ADD CONSTRAINT "portfolio_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."portfolio"
    ADD CONSTRAINT "portfolio_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."user_info"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_code"
    ADD CONSTRAINT "project_code_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."project"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_user"
    ADD CONSTRAINT "project_user_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_user"
    ADD CONSTRAINT "project_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_info"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_info"
    ADD CONSTRAINT "user_info_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_info"
    ADD CONSTRAINT "user_info_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."role"("id") ON DELETE RESTRICT;

CREATE POLICY "Enable delete for author" ON "public"."comment" FOR DELETE USING (("auth"."uid"() = "author_id"));

CREATE POLICY "Enable delete for author" ON "public"."paragraph" FOR DELETE USING (("auth"."uid"() = ( SELECT "portfolio"."student_id"
   FROM "public"."portfolio"
  WHERE ("portfolio"."id" = "paragraph"."portfolio"))));

CREATE POLICY "Enable delete for users based on author" ON "public"."portfolio" FOR DELETE USING (("auth"."uid"() = "student_id"));

CREATE POLICY "Enable delete for users based on professor in project" ON "public"."project" FOR DELETE USING ((("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = "project"."id")))));

CREATE POLICY "Enable insert for professor in project" ON "public"."project_code" FOR INSERT TO "authenticated" WITH CHECK ((("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = "project_code"."id")))));

CREATE POLICY "Enable read access for all" ON "public"."project_user" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."role" FOR SELECT USING (true);

CREATE POLICY "Enable read access for author and professor in project" ON "public"."paragraph" FOR SELECT USING ((("auth"."uid"() = ( SELECT "portfolio"."student_id"
   FROM "public"."portfolio"
  WHERE ("portfolio"."id" = "paragraph"."portfolio"))) OR (("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = ( SELECT "portfolio"."project_id"
           FROM "public"."portfolio"
          WHERE ("portfolio"."id" = "paragraph"."portfolio"))))))));

CREATE POLICY "Enable read access for author and professor in project" ON "public"."portfolio" FOR SELECT USING ((("auth"."uid"() = "student_id") OR (("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = "portfolio"."project_id"))))));

CREATE POLICY "Enable read access for professor and student id" ON "public"."comment" FOR SELECT USING ((("auth"."uid"() = ( SELECT "portfolio"."student_id"
   FROM "public"."portfolio"
  WHERE ("portfolio"."id" = "comment"."portfolio_id"))) OR (("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = ( SELECT "portfolio"."project_id"
           FROM "public"."portfolio"
          WHERE ("portfolio"."id" = "comment"."portfolio_id"))))))));

CREATE POLICY "Enable read access for user in same project" ON "public"."user_info" FOR SELECT USING (((0 <> ( SELECT "count"(*) AS "count"
   FROM "public"."project_user"
  WHERE (("project_user"."user_id" = "auth"."uid"()) AND ("project_user"."project_id" IN ( SELECT "project_user_1"."project_id"
           FROM "public"."project_user" "project_user_1"
          WHERE ("project_user_1"."user_id" = "user_info"."id")))))) OR ("auth"."uid"() = "id")));

CREATE POLICY "Enable select  for users in project" ON "public"."project" FOR SELECT TO "authenticated" USING (("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = "project"."id"))));

CREATE POLICY "Enable select for professor in project" ON "public"."project_code" FOR SELECT USING ((("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = "project_code"."id")))));

CREATE POLICY "Enable update for author" ON "public"."comment" FOR UPDATE USING (("auth"."uid"() = "author_id")) WITH CHECK (("auth"."uid"() = "author_id"));

CREATE POLICY "Enable update for author" ON "public"."paragraph" FOR UPDATE USING (("auth"."uid"() = ( SELECT "portfolio"."student_id"
   FROM "public"."portfolio"
  WHERE ("portfolio"."id" = "paragraph"."portfolio")))) WITH CHECK (("auth"."uid"() = ( SELECT "portfolio"."student_id"
   FROM "public"."portfolio"
  WHERE ("portfolio"."id" = "paragraph"."portfolio"))));

CREATE POLICY "Enable update for professor in project" ON "public"."project_code" FOR UPDATE USING ((("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = "project_code"."id"))))) WITH CHECK ((("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = "project_code"."id")))));

CREATE POLICY "Enable update for users based on author" ON "public"."portfolio" FOR UPDATE USING (("auth"."uid"() = "student_id")) WITH CHECK (("auth"."uid"() = "student_id"));

CREATE POLICY "Enable update for users based on professor in project" ON "public"."project" FOR UPDATE USING ((("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = "project"."id"))))) WITH CHECK ((("public"."getUserRole"() = 'professor'::"text") AND ("auth"."uid"() IN ( SELECT "project_user"."user_id"
   FROM "public"."project_user"
  WHERE ("project_user"."project_id" = "project"."id")))));

ALTER TABLE "public"."comment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."paragraph" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."portfolio" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."project" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."project_code" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."project_user" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."role" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_info" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."TR_deleteExpiredCode"() TO "anon";
GRANT ALL ON FUNCTION "public"."TR_deleteExpiredCode"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."TR_deleteExpiredCode"() TO "service_role";

GRANT ALL ON FUNCTION "public"."TR_deleteFileOnPortfolioDelete"() TO "anon";
GRANT ALL ON FUNCTION "public"."TR_deleteFileOnPortfolioDelete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."TR_deleteFileOnPortfolioDelete"() TO "service_role";

GRANT ALL ON FUNCTION "public"."TR_populateUser"() TO "anon";
GRANT ALL ON FUNCTION "public"."TR_populateUser"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."TR_populateUser"() TO "service_role";

GRANT ALL ON FUNCTION "public"."TR_renameUnamedPortfolio"() TO "anon";
GRANT ALL ON FUNCTION "public"."TR_renameUnamedPortfolio"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."TR_renameUnamedPortfolio"() TO "service_role";

GRANT ALL ON FUNCTION "public"."TR_renameUnamedProject"() TO "anon";
GRANT ALL ON FUNCTION "public"."TR_renameUnamedProject"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."TR_renameUnamedProject"() TO "service_role";

GRANT ALL ON FUNCTION "public"."_bugged"() TO "anon";
GRANT ALL ON FUNCTION "public"."_bugged"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_bugged"() TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_createComment"("arg_portfolio_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."fn_createComment"("arg_portfolio_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_createComment"("arg_portfolio_id" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_createParagraph"("portfolio_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."fn_createParagraph"("portfolio_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_createParagraph"("portfolio_id" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_createPortfolio"("arg_project_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."fn_createPortfolio"("arg_project_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_createPortfolio"("arg_project_id" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_createProject"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_createProject"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_createProject"() TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_deleteExpiredCode"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_deleteExpiredCode"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_deleteExpiredCode"() TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_joinProject"("join_id" integer, "join_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_joinProject"("join_id" integer, "join_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_joinProject"("join_id" integer, "join_code" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_kickUser"("arg_user_id" "uuid", "arg_project_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."fn_kickUser"("arg_user_id" "uuid", "arg_project_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_kickUser"("arg_user_id" "uuid", "arg_project_id" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_queryUserList"("query_project_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."fn_queryUserList"("query_project_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_queryUserList"("query_project_id" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_searchUser"("arg_search" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_searchUser"("arg_search" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_searchUser"("arg_search" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_setRole"("arg_role" integer, "arg_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_setRole"("arg_role" integer, "arg_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_setRole"("arg_role" integer, "arg_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."fn_userExist"("arg_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_userExist"("arg_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_userExist"("arg_email" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."getUserRole"() TO "anon";
GRANT ALL ON FUNCTION "public"."getUserRole"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."getUserRole"() TO "service_role";

GRANT ALL ON TABLE "public"."comment" TO "anon";
GRANT ALL ON TABLE "public"."comment" TO "authenticated";
GRANT ALL ON TABLE "public"."comment" TO "service_role";

GRANT ALL ON SEQUENCE "public"."comment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comment_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."paragraph" TO "anon";
GRANT ALL ON TABLE "public"."paragraph" TO "authenticated";
GRANT ALL ON TABLE "public"."paragraph" TO "service_role";

GRANT ALL ON SEQUENCE "public"."paragraph_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."paragraph_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."paragraph_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."portfolio" TO "anon";
GRANT ALL ON TABLE "public"."portfolio" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolio" TO "service_role";

GRANT ALL ON SEQUENCE "public"."portfolio_portfolio_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."portfolio_portfolio_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."portfolio_portfolio_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."project" TO "anon";
GRANT ALL ON TABLE "public"."project" TO "authenticated";
GRANT ALL ON TABLE "public"."project" TO "service_role";

GRANT ALL ON TABLE "public"."project_code" TO "anon";
GRANT ALL ON TABLE "public"."project_code" TO "authenticated";
GRANT ALL ON TABLE "public"."project_code" TO "service_role";

GRANT ALL ON SEQUENCE "public"."project_code_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_code_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_code_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."project_project_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_project_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_project_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."project_user" TO "anon";
GRANT ALL ON TABLE "public"."project_user" TO "authenticated";
GRANT ALL ON TABLE "public"."project_user" TO "service_role";

GRANT ALL ON TABLE "public"."role" TO "anon";
GRANT ALL ON TABLE "public"."role" TO "authenticated";
GRANT ALL ON TABLE "public"."role" TO "service_role";

GRANT ALL ON SEQUENCE "public"."role_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."role_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."role_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_info" TO "anon";
GRANT ALL ON TABLE "public"."user_info" TO "authenticated";
GRANT ALL ON TABLE "public"."user_info" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
