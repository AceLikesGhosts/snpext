export type IAuthors = {
    shortName: string;
    githubUrl: string;
};

export const Authors = {
    ACE: {
        shortName: 'ace',
        githubUrl: 'https://github.com/acelikesghosts'
    }
} as Record<string, IAuthors>;