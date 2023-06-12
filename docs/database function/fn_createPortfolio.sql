DECLARE
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
end