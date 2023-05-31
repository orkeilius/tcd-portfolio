
export default function ImageParallax(props) {

    function handleMouseMove(event) {
        let offest = {
            x: (window.innerWidth / 2) / event.clientX * -100,
            y: (window.innerHeight / 2) / event.clientY * -100 ,
        };
        offest = {
            x: Math.max(-100, Math.min(100,offest.x)),
            y: Math.max(-100, Math.min(100,offest.y))
        };

        const parallax = document.getElementById('parallax');

        parallax.style.setProperty('--tw-translate-x', (offest.x * 0.02).toString()+ '%');
        parallax.style.setProperty('--tw-translate-y', (offest.y * 0.02).toString()+ '%');

    }

    window.addEventListener("mousemove", handleMouseMove);
    return (
        <div className={"overflow-hidden" + props.className } >
            <img id="parallax" alt="" src={props.src} className="transition-all duration-0 scale-125 relative object-cover w-full h-full" />
        </div>
    );
}
