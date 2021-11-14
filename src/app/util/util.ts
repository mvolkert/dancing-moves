export const regexGermanDate = /(\d\d).(\d\d).(\d\d\d\d)/y;
export const regexIsoDate = /(\d\d\d\d)-(\d\d)-(\d\d)/y;

export const parseDate = (dateString: string): Date => {
    const match = regexGermanDate.exec(dateString);
    if (match) {
        dateString = `${match[3]}-${match[2]}-${match[1]}`
    }
    return new Date(dateString);
}

export const toGermanDate = (date: Date): string => {
    console.log(date);
    if (!date || isNaN(date.getTime())) {
        return "";
    }
    const isoString = date.toISOString();
    const match = regexIsoDate.exec(isoString);
    if (match) {
        return `${match[3]}.${match[2]}.${match[1]}`
    }
    return isoString;
}

export const parseBoolean = (boolString: string): boolean => {
    boolString = boolString?.toLowerCase();
    return boolString == "true" || boolString == "wahr";
}