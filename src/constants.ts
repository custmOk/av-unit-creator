const adminEmails = import.meta.env.VITE_ADMIN_EMAILS;

export const isAdmin = (session: any) => {
    return adminEmails.includes(session?.user?.email);
};