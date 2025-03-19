import '../Pages/Styles/Navbar.css';
import "bootstrap/dist/css/bootstrap.min.css";
function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">PagContas 💰</div>
      <ul className="navbar-links">
        <li><a href="#">Início</a></li>
        <li><a href="#">Pagamentos</a></li>
        <li><a href="#">Recompensas</a></li>
        <li><a href="#">Contato</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
