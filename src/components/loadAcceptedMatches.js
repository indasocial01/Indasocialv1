export async function loadAcceptedMatches(supabase, userId) {
  const { data, error } = await supabase
    .from('user_matches')
    .select(`
      id,
      requester:profiles!requester_id(id, full_name, avatar_url, industry, niche, avg_rating, verification_score, user_role),
      target:profiles!target_id(id, full_name, avatar_url, industry, niche, avg_rating, verification_score, user_role)
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},target_id.eq.${userId}`);

  if (error) throw error;

  return data.flatMap((match) => {
    const other = match.requester?.id === userId ? match.target : match.requester;
    if (!other) return [];

    return [{
      id: match.id,
      profile: {
        id: other.id,
        name: other.full_name || 'Usuario',
        avatar: other.avatar_url,
        logo: other.full_name?.charAt(0).toUpperCase() || '👤',
        industry: other.industry,
        niche: other.niche,
        avgRating: other.avg_rating || 0,
        verificationScore: other.verification_score || 0,
        color: other.user_role === 'creator' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500',
      },
    }];
  });
}
