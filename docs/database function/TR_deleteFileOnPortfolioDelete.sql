CREATE FUNCTION "public"."TR_deleteFileOnPortfolioDelete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  delete from storage.objects 
  where bucket_id = 'media' and path_tokens[1] = cast (OLD.id as text);
  return OLD;
end$$;