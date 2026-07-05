import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']
const AUTH_PATHS = ['/']

export function middleware(request: NextRequest) {
    const token = request.cookies.get('flix_token')?.value
    const { pathname } = request.nextUrl

    // Usuário logado tentando acessar login/register → manda para home
    if (token && PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Usuário não logado tentando acessar área protegida → apresentação
    if (!token && !PUBLIC_PATHS.includes(pathname) && pathname !== '/apresentacao') {
        return NextResponse.redirect(new URL('/apresentacao', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}