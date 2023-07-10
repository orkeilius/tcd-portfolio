BEGIN

  insert into public."user_info" ("id","first_name","last_name","role") 
  values (
    new.id,
    new.raw_user_meta_data ->> 'firstName',
    new.raw_user_meta_data ->> 'lastName',
    '2'
  );
  
  return new;
END