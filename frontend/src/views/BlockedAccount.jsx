import { Link } from 'react-router-dom';

const BlockedAccount = () => {
    return (
        <main className="bg-[#111827] min-h-screen flex flex-col justify-center items-center text-white p-4">
            <h1 className="text-2xl font-bold mb-4">Cuenta Bloqueada</h1>
            <p className="mb-6">Tu cuenta ha sido bloqueada. Contacta en victoriusd4@gmail.com para soporte.</p>
            <Link to="/login" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500">
                Volver a Login
            </Link>
        </main>
    );
};

export default BlockedAccount;
