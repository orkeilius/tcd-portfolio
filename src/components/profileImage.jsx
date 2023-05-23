export default function ProfileImage(props) {
    const color = {
        backgroundColor: `hsl(${getHue(
            props.firstName + props.lastName
        )}deg 65% 85%)`,
    };
    if (props.firstName == undefined || props.lastName == undefined) {
        return  <div className="bg-slate-500 rounded-full h-12 aspect-square" />
    }
    return (
        <div className={`rounded-full h-12 aspect-square flex items-center justify-center`} style={color}>
            <hi className="text-center font-bold text-xl" >{props.firstName.charAt(0).toUpperCase() + props.lastName.charAt(0).toUpperCase() }</hi>
        </div>
    );
}

function getHue(str) {
    var total = 0;
    for (let i = 0; i < str.length; i++) {
        total += str.charCodeAt(str);
    }
    return total % 360;
}
