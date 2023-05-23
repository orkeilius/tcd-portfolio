export default function ProfileImage(props) {
    const color = {
        backgroundColor: `hsl(${getHue(
            props.firstName + props.lastName
        )}deg 65% 85%)`,
    };

    return (
        <div className={`rounded-full h-12 aspect-square flex items-center justify-center`} style={color}>
            <hi className="text-center font-bold text-xl" >{props.firstName.charAt(0) + props.lastName.charAt(0) }</hi>
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
