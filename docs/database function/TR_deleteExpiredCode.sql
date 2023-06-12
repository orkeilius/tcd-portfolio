begin
  delete from project_code 
  where expire < now();
  return new;
end