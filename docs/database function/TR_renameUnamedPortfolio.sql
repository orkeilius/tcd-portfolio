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