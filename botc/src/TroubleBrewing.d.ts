declare const tb: {
    name: string;
    roles: ({
        role: string;
        alignment: string;
        team: string;
        ability: {
            trigger: string;
            target: string;
            cause: string;
            special: {
                target: string;
                ability: string;
                team?: undefined;
                modifiedteam?: undefined;
                count?: undefined;
            };
        };
        aligment?: undefined;
    } | {
        role: string;
        alignment: string;
        team: string;
        ability: {
            trigger: string;
            target: string;
            cause: string;
            special: undefined;
        };
        aligment?: undefined;
    } | {
        role: string;
        alignment: string;
        team: string;
        ability: {
            trigger: string;
            target: undefined;
            cause: string;
            special: {
                team: string;
                modifiedteam: string;
                count: number;
                target?: undefined;
                ability?: undefined;
            };
        };
        aligment?: undefined;
    } | {
        role: string;
        alignment: string;
        team: string;
        ability: {
            trigger: string;
            target: undefined;
            cause: string;
            special: undefined;
        };
        aligment?: undefined;
    } | {
        role: string;
        aligment: string;
        team: string;
        ability: {
            trigger?: undefined;
            target?: undefined;
            cause?: undefined;
            special?: undefined;
        };
        alignment?: undefined;
    })[];
};
export { tb };
