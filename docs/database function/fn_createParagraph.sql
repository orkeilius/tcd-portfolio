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