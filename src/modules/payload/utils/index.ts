export const isAdmin = ({ req }: { req: any }) => req.user?.role === 'admin'
