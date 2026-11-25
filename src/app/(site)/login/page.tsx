import Link from "next/link";
export default function Login() {
  return (<div className="wrap max-w-md py-16"><div className="card"><h1 className="text-3xl font-bold">Student <span className="text-gold">login</span></h1>
    <label className="label">Email or phone</label><input className="input" defaultValue="anjali@mail.com" />
    <label className="label">Course password</label><input className="input" type="password" defaultValue="password" />
    <p className="my-3 text-xs text-mute">🔒 Videos play on one device at a time. Logging in here signs you out of other devices.</p>
    <Link href="/student" className="btn block text-center">Login</Link>
    <p className="mt-3 text-xs text-mute">No password? <Link href="/courses" className="text-gold">Enrol in a course</Link> or ask academy staff.</p></div></div>);
}
