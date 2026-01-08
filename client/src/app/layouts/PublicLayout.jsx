import { Outlet } from "react-router-dom";
// import Footer from "../components/Footer";

export default function PublicLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Outlet />
            {/* <Footer /> */}
        </div>
    )
}