CREATE FUNCTION public.create_profile_for_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profile (id, email, user_name, avatar)
VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'fullname',
        NEW.raw_user_meta_data->>'avatar'
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
/* --- */
CREATE TRIGGER create_profile_on_signup
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.create_profile_for_new_user();
/* --- */