begin
  if '' in  (select name from project) then
    update project
    set name = 'untitled project '
    where name = '';
  end if;
  return new;
end