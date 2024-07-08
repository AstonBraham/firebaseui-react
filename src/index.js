"use client";
import React, { useEffect, useRef, useState } from "react";
import Provider from "./Provider";
import { providerStyles } from "./providerStyles";
import PhoneNumber from "./PhoneNumber";
import EmailLink from "./EmailLink";
import { isSignInWithEmailLink, onAuthStateChanged } from "firebase/auth";
import VerifyEmail from "./VerifyEmail";
import ResetPassword from "./ResetPassword";

export default function FirebaseUI({
  auth,
  url,
  config = { signInOptions: [{ provider: "emailpassword" }] },
}) {
  if (!auth) {
    throw new Error("FirebaseUI requires 'auth' prop.");
  }

  const [emailLinkOpen, setEmailLinkOpen] = useState(false);
  const [queryParams, setQueryParams] = useState(null)
  const [sendSMS, setSendSMS] = useState(false);
  const [verify, setVerify] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false) // only true when the user logs in from the reset password link
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false) // controls whether the reset password form is open
  const [mfaSignIn, setMfaSignIn] = useState(false);
  const [mfaResolver, setMfaResolver] = useState();
  const [showComponent, setShowComponent] = useState(false);

  const [alert, setAlert] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    //initialize values based on query params
    const params = new URLSearchParams(window.location.search)
    setQueryParams(params)
    setEmailLinkOpen(isSignInWithEmailLink(auth, window.location.href))
    setIsResetPassword(params.get('resetPassword') === "true")
    setShowComponent(true)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (error && alert) {
      setAlert("")
    }
  }, [error])

  useEffect(() => {
    if (alert && error) {
      setError("")
    }
  }, [alert])

  useEffect(() => {
    //open the email verification for signed in but unverified users.
    if (
      config?.requireVerifyEmail &&
      user &&
      user.providerData[0].providerId == "password" &&
      !user?.emailVerified
    ) {
      setVerify(true);
    }
  }, [user]);

  return (
    <>
      {showComponent && <div
        style={{
          margin: '0 auto',
          width: '100%',
          height: 'fit-content',
          borderRadius: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0.75rem',
          gap: '0.75rem',
          ...config?.containerStyles
        }}
      >
        {resetPasswordOpen &&
          <ResetPassword
            callbacks={config?.callbacks}
            setAlert={setAlert}
            setError={setError}
            auth={auth}
            passwordSpecs={config?.passwordSpecs}
            formButtonStyles={config?.formButtonStyles}
            formDisabledStyles={config?.formDisabledStyles}
            formInputStyles={config?.formInputStyles}
            formLabelStyles={config?.formLabelStyles}
            formSmallButtonStyles={config?.formSmallButtonStyles}
            customErrors={config?.customErrors}
            language={config?.language}
            customText={config?.customText}
          />}
        {!sendSMS &&
          !emailLinkOpen && !verify && !resetPasswordOpen &&
          config?.signInOptions?.map((provider, i) => {
            if (typeof provider == "string") {
              return (
                <Provider
                  key={i}
                  auth={auth}
                  providerId={provider}
                  callbacks={config?.callbacks}
                  continueUrl={url || config?.continueUrl}
                  displayName={config?.displayName}
                  setSendSMS={setSendSMS}
                  setEmailLinkOpen={setEmailLinkOpen}
                  setAlert={setAlert}
                  setError={setError}
                  user={user}
                  setVerify={setVerify}
                  setMfaSignIn={setMfaSignIn}
                  setMfaResolver={setMfaResolver}
                  passwordSpecs={config?.passwordSpecs}
                  formButtonStyles={config?.formButtonStyles}
                  formDisabledStyles={config?.formDisabledStyles}
                  formInputStyles={config?.formInputStyles}
                  formLabelStyles={config?.formLabelStyles}
                  formSmallButtonStyles={config?.formSmallButtonStyles}
                  customErrors={config?.customErrors}
                  language={config?.language}
                  customText={config?.customText}
                />
              );
            } else if (typeof provider == "object") {
              return (
                <Provider
                  key={i}
                  auth={auth}
                  providerId={provider?.provider}
                  {...provider}
                  passwordSpecs={config?.passwordSpecs}
                  callbacks={config?.callbacks}
                  continueUrl={url || config?.continueUrl}
                  displayName={config?.displayName}
                  setSendSMS={setSendSMS}
                  setEmailLinkOpen={setEmailLinkOpen}
                  setAlert={setAlert}
                  setError={setError}
                  user={user}
                  setVerify={setVerify}
                  setMfaSignIn={setMfaSignIn}
                  setMfaResolver={setMfaResolver}
                  formButtonStyles={config?.formButtonStyles}
                  formDisabledStyles={config?.formDisabledStyles}
                  formInputStyles={config?.formInputStyles}
                  formLabelStyles={config?.formLabelStyles}
                  formSmallButtonStyles={config?.formSmallButtonStyles}
                  customErrors={config?.customErrors}
                  language={config?.language}
                  customText={config?.customText}
                />
              );
            }
          })}
        {sendSMS && (
          <PhoneNumber
            callbacks={config?.callbacks}
            auth={auth}
            setSendSMS={setSendSMS}
            setAlert={setAlert}
            setError={setError}
            user={user}
            mfaSignIn={mfaSignIn}
            mfaResolver={mfaResolver}
            isResetPassword={isResetPassword}
            setResetPasswordOpen={setResetPasswordOpen}
            displayName={config?.displayName}
            whitelistedCountries={config?.whitelistedCountries}
            formButtonStyles={config?.formButtonStyles}
            formDisabledStyles={config?.formDisabledStyles}
            formInputStyles={config?.formInputStyles}
            formLabelStyles={config?.formLabelStyles}
            formSmallButtonStyles={config?.formSmallButtonStyles}
            customErrors={config?.customErrors}
            setMfaResolver={setMfaResolver}
            setMfaSignIn={setMfaSignIn}
            language={config?.language}
            customText={config?.customText}
          />
        )}
        {verify && (
          <VerifyEmail
            user={user}
            setAlert={setAlert}
            setError={setError}
            setSendSMS={setSendSMS}
            language={config?.language}
            customText={config?.customText}
          />
        )}
        {emailLinkOpen && (
          <EmailLink
            auth={auth}
            setEmailLinkOpen={setEmailLinkOpen}
            continueUrl={url || config?.continueUrl}
            setAlert={setAlert}
            setError={setError}
            user={user}
            setMfaSignIn={setMfaSignIn}
            setMfaResolver={setMfaResolver}
            setSendSMS={setSendSMS}
            isResetPassword={isResetPassword}
            setResetPasswordOpen={setResetPasswordOpen}
            displayName={config?.displayName}
            formButtonStyles={config?.formButtonStyles}
            formDisabledStyles={config?.formDisabledStyles}
            formInputStyles={config?.formInputStyles}
            formLabelStyles={config?.formLabelStyles}
            formSmallButtonStyles={config?.formSmallButtonStyles}
            customErrors={config?.customErrors}
            language={config?.language}
            customText={config?.customText}
          />
        )}

        {/* TODO: if there's an onClick handler, for accessibility the element should be a button */}
        {alert && (
          <div
            onClick={() => setAlert("")}
            style={{
              padding: "0.25rem",
              width: "100%",
              backgroundColor: "#fefcbf", // yellow-100
              border: "1px solid #fef9c3", // yellow-200
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              borderRadius: "0.375rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p style={{ padding: "0.25rem" }}>{alert}</p>
          </div>
        )}
        {error && (
          <div
            onClick={() => setError("")}
            style={{
              padding: "0.25rem",
              width: "100%",
              backgroundColor: "#fed7d7", // red-100
              border: "1px solid #fecaca", // red-200
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              borderRadius: "0.375rem",
            }}
          >
            <p style={{ padding: "0.25rem" }}>{error}</p>
          </div>
        )}
      </div>}
    </>
  );
}
