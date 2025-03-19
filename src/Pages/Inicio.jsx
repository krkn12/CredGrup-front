import "./Styles/Inicio.css";

function Inicio({ currentUser }) {
  return (
    <div className="inicio-container">
      <h1 className="inicio-title">PagContas 💰</h1>
      <h2 className="inicio-subtitle">
        {currentUser 
          ? `Bem-vindo de volta, ${currentUser.name.split(' ')[0]}! 🚀` 
          : 'Pague suas contas e ganhe recompensas em Bitcoin! 🚀'}
      </h2>
      <p className="inicio-description">
        Facilitamos o pagamento de contas com cashback em BTC.
      </p>
    </div>
  );
}

export default Inicio;