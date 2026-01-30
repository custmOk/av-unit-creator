const adminEmail: string = import.meta.env.VITE_ADMIN_EMAIL || '';

export const isAdmin = (session: any) => {
    return session?.user?.email === adminEmail;
};