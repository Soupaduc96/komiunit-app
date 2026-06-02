static async getUserSends(userId: string): Promise<Send[]> {
  const { data, error } = await supabase
    .from('komi_sends')
    .select(`
      *,
      recipient:users!komi_sends_recipient_id_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  console.log('================================');
  console.log('KOMI SEND DEBUG');
  console.log('USER ID:', userId);
  console.log('SUPABASE DATA:', data);
  console.log('SUPABASE ERROR:', error);
  console.log('================================');

  if (error) {
    console.error('KOMI SEND ERROR:', error);
    throw new Error(error.message);
  }

  const sends = (data ?? []).map(mapSend);

  console.log('MAPPED SENDS:', sends);

  return sends;
}