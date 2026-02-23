import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password',
    })
    if (error) {
        console.error('Login error:', error)
        return
    }
    const session = data.session
    if (!session) {
        console.error('No session')
        return
    }
    const res = await fetch('http://localhost:3000/', {
        headers: {
            Cookie: `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token=${JSON.stringify(session)}`
        }
    })
    const text = await res.text()
    if (text.includes('Application error')) {
        console.log('Error reproduced in HTML output.')
    } else {
        // try clicking simulate
    }
}
main()
