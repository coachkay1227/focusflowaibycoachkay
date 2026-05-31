CREATE POLICY "Service role can delete build inquiries"
ON public.build_inquiries
FOR DELETE
TO public
USING (auth.role() = 'service_role');