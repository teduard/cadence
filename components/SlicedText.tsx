export function SlicedText() {
    const valentines = new Date();//"2026-09-11"
    const day = valentines.getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    //console.log(dayNames[day]); // "Monday"

    const currentDay = dayNames[day];

    //return <h3 className="sliced">TUESDAY</h3>
    return <h4 className="sliced-text">{currentDay}</h4>
}