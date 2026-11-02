import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./DashboardLayout.css";

function DashboardLayout({ title, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container dash">
      <aside className="dash-side">
        <div className="dash-side-inner">
          <div className="dash-user">
            <span className="dash-avatar">{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <p className="dash-name">{user.name}</p>
              <p className="dash-role">{title}</p>
            </div>
          </div>

          <p className="dash-menu-label">Menu</p>
          <nav className="dash-nav">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className="dash-link"
                >
                  <Icon size={19} /> {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="dash-bottom">
            <NavLink to="/" className="dash-link">
              <Store size={19} /> Back to store
            </NavLink>
            <button className="dash-logout" onClick={handleLogout}>
              <LogOut size={19} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;