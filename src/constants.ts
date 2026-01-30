const adminEmails: string[] = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];

export const isAdmin = (session: any) => {
    return adminEmails.includes(session?.user?.email);
};