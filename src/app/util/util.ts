import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const regexGermanDate = /([0-9]{2})\.([0-9]{2})\.([0-9]{4})/;
export const regexIsoDate = /([0-9]{4})-([0-9]{2})-([0-9]{2})/;
export const regexTable = /[A-Za-z0-9\s]+\![A-Z]+[0-9]+\:[A-Z]+([0-9]+)/;

export const parseDate = (dateString: string): Date | null => {
    dateString = dateString?.trim();
    const match = regexGermanDate.exec(dateString);
    if (match) {
        dateString = `${match[3]}-${match[2]}-${match[1]}`
    }
    const date = new Date(dateString);
    if (date?.toString() == 'Invalid Date') {
        return null;
    }
    return date;
}

export const toGermanDate = (date: Date | null): string => {
    console.log(date);
    if (typeof date === 'string') {
        console.log('date is string');
        date = parseDate(date as unknown as string);
    }
    if (!date) {
        return "";
    }
    if (isNaN(date.getTime())) {
        return "";
    }
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export const parseBoolean = (boolString: string): boolean => {
    boolString = boolString?.toLowerCase();
    return boolString == "true" || boolString == "wahr";
}

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getRow = (tableString: string): number => {
    tableString = tableString?.trim();
    const match = regexTable.exec(tableString);
    if (match) {
        console.log(match);
        return Number(match[1]);
    }
    return NaN;
}

export const olderThanADay = (date: Date): boolean => {
    return ((new Date().getTime()) - date.getTime()) > 24 * 60 * 60 * 1000;
}

export const deepCopy = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
}

export const nameExistsValidator = (getOtherNames: () => Set<string>): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
        const forbidden = getOtherNames()?.has(control.value);
        return forbidden ? { nameExists: { value: control.value } } : null;
    };
}

export const generateSortFn = <T>(getters: Array<(x: T) => any>) => {
    return (a: T, b: T) => {
        for (let getter of getters) {
            if (getter(a) < getter(b))
                return -1;
            if (getter(a) > getter(b))
                return 1;
        }
        return 0;
    };
};