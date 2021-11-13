export const regexGermanDate = /(\d\d).(\d\d).(\d\d\d\d)/y;


export const parseDate = (dateString: string): Date => {
    const match = regexGermanDate.exec(dateString);
    if (match) {
        dateString = `${match[3]}-${match[2]}-${match[1]}`
    }
    return new Date(dateString);
}

export const parseBoolean = (boolString: string) : boolean => {
    return Boolean(JSON.parse(boolString.toLowerCase()));
}