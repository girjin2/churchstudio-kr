import { handleUpload } from '@vercel/blob/client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nodijpmukvclftlegyyu.supabase.co';
const supabaseKey = 'sb_publishable_RoTpordkjKkCsddiof-Y5g_PB3bGtP2';

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!clientPayload) throw new Error('로그인이 필요합니다.');

        let payload;
        try {
          payload = JSON.parse(clientPayload);
        } catch {
          throw new Error('인증 정보가 올바르지 않습니다.');
        }

        const accessToken = payload?.accessToken;
        if (!accessToken) throw new Error('로그인이 필요합니다.');

        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: `Bearer ${accessToken}` } },
          auth: { persistSession: false, autoRefreshToken: false }
        });

        const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
        if (userError || !userData?.user) throw new Error('로그인 세션을 확인할 수 없습니다.');

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', userData.user.id)
          .maybeSingle();

        if (profile?.role !== 'admin') throw new Error('관리자만 파일을 올릴 수 있습니다.');

        return {
          allowedContentTypes: [
            'application/zip',
            'application/x-zip-compressed',
            'application/octet-stream'
          ],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: userData.user.id })
        };
      },
      onUploadCompleted: async () => {}
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : '업로드에 실패했습니다.' }, { status: 400 });
  }
}
