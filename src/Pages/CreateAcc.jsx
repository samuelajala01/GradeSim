import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createUserDocument } from "../utils/firestore";
import { Card, CardHeader } from "../Components/ui/Card";
import { Input } from "../Components/ui/Input";
import { Label } from "../Components/ui/Input";
import { Select } from "../Components/ui/Input";
import { Button } from "../Components/ui/Button";

export default function CreateAcc() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [course, setCourse] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword)
      return setError("Passwords do not match");
    const userData = {
      firstName,
      lastName,
      course,
      educationLevel,
    };
    setBusy(true);
    try {
      const result = await signup(email, password, userData);
      try {
        await createUserDocument(result.user.uid, { ...userData, email });
      } catch (docErr) {
        console.warn("Firestore profile skipped:", docErr);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <CardHeader title="Create account" description="Set up GradeSim tracking." />

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="course">Program / course focus</Label>
            <Input
              id="course"
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="education-level">Education level</Label>
            <Select
              id="education-level"
              required
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            >
              <option value="">Choose one</option>
              <option value="high-school">High school</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Postgraduate</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger text-center">{error}</p>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Creating account…" : "Sign up"}
          </Button>
        </form>

        <p className="text-sm text-muted text-center mt-8">
          Already registered?{" "}
          <Link to="/login" className="text-accent font-medium hover:text-accent-hover">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
