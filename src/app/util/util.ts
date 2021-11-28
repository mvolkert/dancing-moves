export const regexGermanDate = /([0-9]{2})\.([0-9]{2})\.([0-9]{4})/;
export const regexIsoDate = /([0-9]{4})-([0-9]{2})-([0-9]{2})/;

export const parseDate = (dateString: string): Date => {
    dateString = dateString.trim();
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

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}