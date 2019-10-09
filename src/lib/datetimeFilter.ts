export default function (dateISOString: string): string {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    if (dateISOString) {
        let d = new Date(dateISOString);
        return new Intl.DateTimeFormat('en-GB', options).format(d);
    } else {
        return 'n/a';
    }
};