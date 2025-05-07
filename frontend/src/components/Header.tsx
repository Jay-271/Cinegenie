interface Props {
    title: string;
}
//This is an example component.
function Header({title}: Props) {
    //function code here

    //return dynamic header title
    return (
        <header className="header">
            <h1>{title}</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;