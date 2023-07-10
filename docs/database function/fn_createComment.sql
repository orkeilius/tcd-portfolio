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