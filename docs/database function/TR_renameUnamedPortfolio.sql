begin
  if '' in (select title from portfolio) then
    update portfolio
    set title = 'untitled portfolio '
    where title = '';
  end if;
  return new;
end