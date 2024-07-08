"use client";

import {
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    updateProfile,
} from "firebase/auth";
import { providerStyles } from "./providerStyles";
import React, { useEffect, useRef, useState } from "react";
import { errors } from "./Errors";
import { translate, translateError } from "./Languages";
import {isValidPhoneNumber, parsePhoneNumber} from "libphonenumber-js/min";

export default function PhoneNumber({
                                        whitelistedCountries = [],
                                        setSendSMS,
                                        setAlert,
                                        setError,
                                        callbacks,
                                        mfaSignIn,
                                        mfaResolver,
                                        auth,
                                        isResetPassword,
                                        setResetPasswordOpen,
                                        displayName,
                                        formButtonStyles,
                                        formDisabledStyles,
                                        formInputStyles,
                                        formLabelStyles,
                                        formSmallButtonStyles,
                                        customErrors,
                                        setMfaResolver,
                                        setMfaSignIn,
                                        language,
                                        customText,
                                    }) {
    //TODO: custom styles here too
    const styles =
        providerStyles["phonenumber"] || providerStyles["default"];
    const [phoneNumber, setPhoneNumber] = useState();
    //TODO phone number validity
    const [phoneNumberValid, setPhoneNumberValid] = useState(false);
    const [enterCode, setEnterCode] = useState(false);
    const [code, setCode] = useState(Array(6).fill(""));
    const [countryCode, setCountryCode] = useState("+1");
    const [verificationId, setVerificationId] = useState();
    const [name, setName] = useState("");
    const [selectedHint, setSelectedHint] = useState(0);



    const allCountries = [
        { value: '+1', label: '🇺🇸 United States +1' },
        { value: '+358', label: '🇦🇽 Aland Islands +358' },
        { value: '+213', label: '🇩🇿 Algeria +213' },
        { value: '+244', label: '🇦🇴 Angola +244' },
        { value: '+1264', label: '🇦🇮 Anguilla +1264' },
        { value: '+61', label: '🇦🇺 Australia +61' },
        { value: '+43', label: '🇦🇹 Austria +43' },
        { value: '+1', label: '🇧🇸 Bahamas +1' },
        { value: '+973', label: '🇧🇭 Bahrain +973' },
        { value: '+880', label: '🇧🇩 Bangladesh +880' },
        { value: '+375', label: '🇧🇾 Belarus +375' },
        { value: '+32', label: '🇧🇪 Belgium +32' },
        { value: '+229', label: '🇧🇯 Benin +229' },
        { value: '+591', label: '🇧🇴 Bolivia +591' },
        { value: '+387', label: '🇧🇦 Bosnia and Herzegovina +387' },
        { value: '+673', label: '🇧🇳 Brunei +673' },
        { value: '+359', label: '🇧🇬 Bulgaria +359' },
        { value: '+257', label: '🇧🇮 Burundi +257' },
        { value: '+855', label: '🇰🇭 Cambodia +855' },
        { value: '+1', label: '🇨🇦 Canada +1' },
        { value: '+238', label: '🇨🇻 Cape Verde +238' },
        { value: '+1345', label: '🇰🇾 Cayman Islands +1345' },
        { value: '+61', label: '🇨🇽 Christmas Island +61' },
        { value: '+61', label: '🇨🇨 Cocos +61' },
        { value: '+243', label: '🇨🇩 Congo, Dem Rep +243' },
        { value: '+385', label: '🇭🇷 Croatia +385' },
        { value: '+357', label: '🇨🇾 Cyprus +357' },
        { value: '+420', label: '🇨🇿 Czech Republic +420' },
        { value: '+45', label: '🇩🇰 Denmark +45' },
        { value: '+1767', label: '🇩🇲 Dominica +1767' },
        { value: '+1', label: '🇩🇴 Dominican Republic +1' },
        { value: '+593', label: '🇪🇨 Ecuador +593' },
        { value: '+240', label: '🇬🇶 Equatorial Guinea +240' },
        { value: '+372', label: '🇪🇪 Estonia +372' },
        { value: '+358', label: '🇫🇮 Finland/Aland Islands +358' },
        { value: '+33', label: '🇫🇷 France +33' },
        { value: '+220', label: '🇬🇲 Gambia +220' },
        { value: '+995', label: '🇬🇪 Georgia +995' },
        { value: '+49', label: '🇩🇪 Germany +49' },
        { value: '+233', label: '🇬🇭 Ghana +233' },
        { value: '+350', label: '🇬🇮 Gibraltar +350' },
        { value: '+30', label: '🇬🇷 Greece +30' },
        { value: '+502', label: '🇬🇹 Guatemala +502' },
        { value: '+592', label: '🇬🇾 Guyana +592' },
        { value: '+36', label: '🇭🇺 Hungary +36' },
        { value: '+354', label: '🇮🇸 Iceland +354' },
        { value: '+62', label: '🇮🇩 Indonesia +62' },
        { value: '+91', label: '🇮🇳 India +91' },
        { value: '+353', label: '🇮🇪 Ireland +353' },
        { value: '+972', label: '🇮🇱 Israel +972' },
        { value: '+39', label: '🇮🇹 Italy +39' },
        { value: '+225', label: '🇨🇮 Ivory Coast +225' },
        { value: '+1876', label: '🇯🇲 Jamaica +1876' },
        { value: '+81', label: '🇯🇵 Japan +81' },
        { value: '+962', label: '🇯🇴 Jordan +962' },
        { value: '+7', label: '🇰🇿 Kazakhstan +7' },
        { value: '+965', label: '🇰🇼 Kuwait +965' },
        { value: '+371', label: '🇱🇻 Latvia +371' },
        { value: '+218', label: '🇱🇾 Libya +218' },
        { value: '+423', label: '🇱🇮 Liechtenstein +423' },
        { value: '+370', label: '🇱🇹 Lithuania +370' },
        { value: '+352', label: '🇱🇺 Luxembourg +352' },
        { value: '+261', label: '🇲🇬 Madagascar +261' },
        { value: '+265', label: '🇲🇼 Malawi +265' },
        { value: '+60', label: '🇲🇾 Malaysia +60' },
        { value: '+960', label: '🇲🇻 Maldives +960' },
        { value: '+223', label: '🇲🇱 Mali +223' },
        { value: '+356', label: '🇲🇹 Malta +356' },
        { value: '+230', label: '🇲🇺 Mauritius +230' },
        { value: '+52', label: '🇲🇽 Mexico +52' },
        { value: '+377', label: '🇲🇨 Monaco +377' },
        { value: '+382', label: '🇲🇪 Montenegro +382' },
        { value: '+1664', label: '🇲🇸 Montserrat +1664' },
        { value: '+258', label: '🇲🇿 Mozambique +258' },
        { value: '+264', label: '🇳🇦 Namibia +264' },
        { value: '+31', label: '🇳🇱 Netherlands +31' },
        { value: '+599', label: '🇳🇱 Netherlands Antilles +599' },
        { value: '+64', label: '🇳🇿 New Zealand +64' },
        { value: '+234', label: '🇳🇬 Nigeria +234' },
        { value: '+47', label: '🇳🇴 Norway +47' },
        { value: '+63', label: '🇵🇭 Philippines +63' },
        { value: '+48', label: '🇵🇱 Poland +48' },
        { value: '+351', label: '🇵🇹 Portugal +351' },
        { value: '+974', label: '🇶🇦 Qatar +974' },
        { value: '+40', label: '🇷🇴 Romania +40' },
        { value: '+250', label: '🇷🇼 Rwanda +250' },
        { value: '+221', label: '🇸🇳 Senegal +221' },
        { value: '+381', label: '🇷🇸 Serbia +381' },
        { value: '+248', label: '🇸🇨 Seychelles +248' },
        { value: '+65', label: '🇸🇬 Singapore +65' },
        { value: '+421', label: '🇸🇰 Slovakia +421' },
        { value: '+386', label: '🇸🇮 Slovenia +386' },
        { value: '+27', label: '🇿🇦 South Africa +27' },
        { value: '+82', label: '🇰🇷 South Korea +82' },
        { value: '+34', label: '🇪🇸 Spain +34' },
        { value: '+94', label: '🇱🇰 Sri Lanka +94' },
        { value: '+1758', label: '🇱🇨 St Lucia +1758' },
        { value: '+249', label: '🇸🇩 Sudan +249' },
        { value: '+46', label: '🇸🇪 Sweden +46' },
        { value: '+41', label: '🇨🇭 Switzerland +41' },
        { value: '+886', label: '🇹🇼 Taiwan +886' },
        { value: '+255', label: '🇹🇿 Tanzania +255' },
        { value: '+228', label: '🇹🇬 Togo +228' },
        { value: '+1868', label: '🇹🇹 Trinidad and Tobago +1868' },
        { value: '+1649', label: '🇹🇨 Turks and Caicos Islands +1649' },
        { value: '+256', label: '🇺🇬 Uganda +256' },
        { value: '+971', label: '🇦🇪 United Arab Emirates +971' },
        { value: '+44', label: '🇬🇧 United Kingdom +44' },
        { value: '+1', label: '🇺🇸 United States +1' },
        { value: '+998', label: '🇺🇿 Uzbekistan +998' },
        { value: '+58', label: '🇻🇪 Venezuela +58' }
    ];

    const filteredCountries = whitelistedCountries?.length > 0
        ? allCountries.filter(country => whitelistedCountries?.includes(country.value))
        : allCountries;

    const processNetworkError = error => {
        error = JSON.parse(JSON.stringify(error));
        if (
            error.code === 400 ||
            (error.code === "auth/network-request-failed" &&
                error?.customData?.message)
        ) {
            let message = error.customData.message;
            let sliced = message.slice(32, message.length - 2);
            error.code = sliced;
        }

        return error;
    };

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    let recaptchaVerifier;

    useEffect(() => {
        setPhoneNumberValid(
            enterCode || mfaSignIn
                ? true
                //: parsePhoneNumber(countryCode+phoneNumber) &&
                : isValidPhoneNumber(countryCode+phoneNumber) &&
                //: /^\d{3}-\d{3}-\d{4}$/.test(phoneNumber) &&
                (displayName == "required" ? name.length > 0 : true),
        );
    }, [phoneNumber, name]);

    const sendMfaText = function () {
        if (!recaptchaVerifier) {
            recaptchaVerifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "invisible",
                },
            );
        }
        if (mfaSignIn && mfaResolver && recaptchaVerifier) {
            const phoneInfoOptions = {
                multiFactorHint: mfaResolver.hints[selectedHint],
                session: mfaResolver.session,
            };
            try {
                phoneAuthProvider
                    .verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
                    .then(vId => {
                        setVerificationId(vId);
                        setEnterCode(true);
                    });
            } catch (error) {
                recaptchaVerifier.clear();
            }
        }
    };

    const inputRefs = Array(6)
        .fill()
        .map(() => useRef(null));

    const handleCodeChange = (value, index) => {
        if (value !== "" && !/\d/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleBackspace = (e, index) => {
        if (e.key === "Backspace" && index > 0 && !code[index]) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handlePhoneInput = value => {
        let cleaned = value.replace(/\D/g, "");

        let parts = [];
        if (cleaned.length > 3) {
            parts.push(cleaned.substring(0, 3));
            cleaned = cleaned.substring(3);
        } else {
            return cleaned;
        }

        if (cleaned.length > 3) {
            parts.push(cleaned.substring(0, 3));
            cleaned = cleaned.substring(3);
        } else {
            parts.push(cleaned);
            return parts.join("-");
        }

        parts.push(cleaned.substring(0, 4));

        return parts.join("-");
    };

    const sendCode = async function () {

      //  console.log("sendCode")
        try {
            if (!recaptchaVerifier) {
                recaptchaVerifier = new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    {
                        size: "invisible",
                    },
                );
            }


          //  console.log('!phoneNumber', !phoneNumber)
            //console.log('!phoneNumberValid', !phoneNumberValid)
            //console.log('!recaptchaVerifier', !recaptchaVerifier)
            if (
                !phoneNumber ||
                // phoneNumber.length < 12 ||
                !phoneNumberValid ||
                !recaptchaVerifier
            ) {

              //  console.log('Invalid phone number')


                return;
            }

            const formattedNumber = countryCode + " " + phoneNumber;


           // console.log('formattedNumber', formattedNumber)
            await signInWithPhoneNumber(
                auth,
                formattedNumber,
                recaptchaVerifier,
            ).then(confirmationResult => {
               // console.log('confirmationResult', confirmationResult)
                setAlert(
                    `${translate(
                        "codeSent",
                        language,
                        customText,
                    )} ${phoneNumber}.`,
                );
                window.confirmationResult = confirmationResult;
                setEnterCode(true);
            }).catch(error => {
             //   console.log(error)
                error = processNetworkError(error);
                setError(translateError(error.code, language, customText));
            });
        } catch (error) {
           // console.log(error)
            error = processNetworkError(error);
            setError(translateError(error.code, language, customText));
        }
    };

    const signInWithCode = async function () {
        try {
            let formattedCode = code.join("");
          //  console.log("formattedCode", formattedCode)
            await window.confirmationResult
                .confirm(formattedCode)
                .then((res) => {

                    console.log(res);
                    //TODO restructure to get user credential
                    if (name.length > 0) {
                        updateProfile(auth.currentUser, { displayName: name });
                    }
                 //   console.log("User signed in successfully.");
                  //  console.log(auth.currentUser);
                   // console.log(name);
                    //   console.log(auth.getCurrentUser());


                    if (callbacks?.signInSuccessWithAuthResult) {

                     //   console.log( "signInSuccessWithAuthResult callback");
                        /* setSendSMS(false);
                         setMfaResolver(null);
                         setMfaSignIn(false);*/
                        callbacks.signInSuccessWithAuthResult(res.user);
                    }
                    else
                    {
                    //    console.log("No callback");
                    }

                    setSendSMS(false);
                }).catch(error => {
                  //  console.log("error confirmationResult", error)
                })
        } catch (error) {
          //  console.log("error", error)
            error = processNetworkError(error);
            setError(translateError(error.code, language, customText));
            if (typeof callbacks?.signInFailure === "function")
                callbacks?.signInFailure(error);
        }
    };

    const handleButtonPress = function () {

      //  alert("handleButtonPress")
     //   console.log("handleButtonPress")
        //TODO verify code!
        if (mfaSignIn && enterCode) {
            let formattedCode = code.join("");
            const cred = PhoneAuthProvider.credential(
                verificationId,
                formattedCode,
            );
            const multiFactorAssertion =
                PhoneMultiFactorGenerator.assertion(cred);
            try {
                mfaResolver
                    .resolveSignIn(multiFactorAssertion)
                    .then(userCred => {
                        if (isResetPassword) {
                            setResetPasswordOpen(true);
                            setSendSMS(false);
                            setMfaResolver(null);
                            setMfaSignIn(false);
                        } else if (callbacks?.signInSuccessWithAuthResult) {
                            setSendSMS(false);
                            setMfaResolver(null);
                            setMfaSignIn(false);
                            callbacks.signInSuccessWithAuthResult(userCred.user);
                        }
                    });
            } catch (error) {
                error = processNetworkError(error);
                setError(translateError(error.code, language, customText));
                if (typeof callbacks?.signInFailure === "function")
                    callbacks?.signInFailure(error);
            }
        } else if (mfaSignIn) {
            sendMfaText();
        } else {
            if (enterCode) {
                console.log("signInWithCode", enterCode)
                signInWithCode();
            } else {
                sendCode();
            }
        }
    };

    return (
        <>
            <h1
                style={{
                    fontWeight: "600",
                    fontSize: "1.125rem",
                    marginBottom: "0.5rem",
                }}
            >
                {enterCode
                    ? translate("enterCode", language, customText)
                    : mfaSignIn
                        ? translate("verifyIdentity", language, customText)
                        : translate("sendSignInText", language, customText)}
            </h1>

            {!enterCode && !mfaSignIn && (
                <form
                    style={{
                        width: "80%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.35rem",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            <label
                                style={{
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    color: "#1a202c",
                                    ...formLabelStyles,
                                }}
                            >
                                {translate("countryCode", language, customText)}
                                <span style={{ color: "#FF0000" }}> *</span>
                            </label>
                            <button
                                onClick={() => setSendSMS(false)}
                                style={{
                                    fontSize: "0.875rem",
                                    color: "#2b6cb0",
                                    border: "none",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                    ...formSmallButtonStyles,
                                }}
                            >
                                {translate("cancel", language, customText)}
                            </button>
                        </div>
                        <select
                            autoComplete="tel-country-code"
                            name="countrycode"
                            id="countrycode"
                            style={{
                                border: "1px solid #e2e8f0", // gray-300
                                borderRadius: "0.375rem",
                                padding: "0.5rem 0.75rem",
                                width: "100%",
                            }}
                            value={countryCode}
                            onChange={e => setCountryCode(e.target.value)}
                        >
                            {filteredCountries.map(country => (
                                <option key={country.value} value={country.value}>{country.label}</option>
                            ))}
                            {/* <option value="+1">🇺🇸 United States +1</option>
              <option value="+358">🇦🇽 Aland Islands +358</option>
              <option value="+213">🇩🇿 Algeria +213</option>
              <option value="+244">🇦🇴 Angola +244</option>
              <option value="+1264">🇦🇮 Anguilla +1264</option>
              <option value="+61">🇦🇺 Australia +61</option>
              <option value="+43">🇦🇹 Austria +43</option>
              <option value="+1">🇧🇸 Bahamas +1</option>
              <option value="+973">🇧🇭 Bahrain +973</option>
              <option value="+880">🇧🇩 Bangladesh +880</option>
              <option value="+375">🇧🇾 Belarus +375</option>
              <option value="+32">🇧🇪 Belgium +32</option>
              <option value="+229">🇧🇯 Benin +229</option>
              <option value="+591">🇧🇴 Bolivia +591</option>
              <option value="+387">
                🇧🇦 Bosnia and Herzegovina +387
              </option>
              <option value="+673">🇧🇳 Brunei +673</option>
              <option value="+359">🇧🇬 Bulgaria +359</option>
              <option value="+257">🇧🇮 Burundi +257</option>
              <option value="+855">🇰🇭 Cambodia +855</option>
              <option value="+1">🇨🇦 Canada +1</option>
              <option value="+238">🇨🇻 Cape Verde +238</option>
              <option value="+1345">🇰🇾 Cayman Islands +1345</option>
              <option value="+61">🇨🇽 Christmas Island +61</option>
              <option value="+61">🇨🇨 Cocos +61</option>
              <option value="+243">🇨🇩 Congo, Dem Rep +243</option>
              <option value="+385">🇭🇷 Croatia +385</option>
              <option value="+357">🇨🇾 Cyprus +357</option>
              <option value="+420">🇨🇿 Czech Republic +420</option>
              <option value="+45">🇩🇰 Denmark +45</option>
              <option value="+1767">🇩🇲 Dominica +1767</option>
              <option value="+1">🇩🇴 Dominican Republic +1</option>
              <option value="+593">🇪🇨 Ecuador +593</option>
              <option value="+240">🇬🇶 Equatorial Guinea +240</option>
              <option value="+372">🇪🇪 Estonia +372</option>
              <option value="+358">
                🇫🇮 Finland/Aland Islands +358
              </option>
              <option value="+33">🇫🇷 France +33</option>
              <option value="+220">🇬🇲 Gambia +220</option>
              <option value="+995">🇬🇪 Georgia +995</option>
              <option value="+49">🇩🇪 Germany +49</option>
              <option value="+233">🇬🇭 Ghana +233</option>
              <option value="+350">🇬🇮 Gibraltar +350</option>
              <option value="+30">🇬🇷 Greece +30</option>
              <option value="+502">🇬🇹 Guatemala +502</option>
              <option value="+592">🇬🇾 Guyana +592</option>
              <option value="+36">🇭🇺 Hungary +36</option>
              <option value="+354">🇮🇸 Iceland +354</option>
              <option value="+62">🇮🇩 Indonesia +62</option>
              <option value="+91">🇮🇳 India +91</option>
              <option value="+353">🇮🇪 Ireland +353</option>
              <option value="+972">🇮🇱 Israel +972</option>
              <option value="+39">🇮🇹 Italy +39</option>
              <option value="+225">🇨🇮 Ivory Coast +225</option>
              <option value="+1876">🇯🇲 Jamaica +1876</option>
              <option value="+81">🇯🇵 Japan +81</option>
              <option value="+962">🇯🇴 Jordan +962</option>
              <option value="+7">🇰🇿 Kazakhstan +7</option>
              <option value="+965">🇰🇼 Kuwait +965</option>
              <option value="+371">🇱🇻 Latvia +371</option>
              <option value="+218">🇱🇾 Libya +218</option>
              <option value="+423">🇱🇮 Liechtenstein +423</option>
              <option value="+370">🇱🇹 Lithuania +370</option>
              <option value="+352">🇱🇺 Luxembourg +352</option>
              <option value="+261">🇲🇬 Madagascar +261</option>
              <option value="+265">🇲🇼 Malawi +265</option>
              <option value="+60">🇲🇾 Malaysia +60</option>
              <option value="+960">🇲🇻 Maldives +960</option>
              <option value="+223">🇲🇱 Mali +223</option>
              <option value="+356">🇲🇹 Malta +356</option>
              <option value="+230">🇲🇺 Mauritius +230</option>
              <option value="+52">🇲🇽 Mexico +52</option>
              <option value="+377">🇲🇨 Monaco +377</option>
              <option value="+382">🇲🇪 Montenegro +382</option>
              <option value="+1664">🇲🇸 Montserrat +1664</option>
              <option value="+258">🇲🇿 Mozambique +258</option>
              <option value="+264">🇳🇦 Namibia +264</option>
              <option value="+31">🇳🇱 Netherlands +31</option>
              <option value="+599">
                🇳🇱 Netherlands Antilles +599
              </option>
              <option value="+64">🇳🇿 New Zealand +64</option>
              <option value="+234">🇳🇬 Nigeria +234</option>
              <option value="+47">🇳🇴 Norway +47</option>
              <option value="+63">🇵🇭 Philippines +63</option>
              <option value="+48">🇵🇱 Poland +48</option>
              <option value="+351">🇵🇹 Portugal +351</option>
              <option value="+974">🇶🇦 Qatar +974</option>
              <option value="+40">🇷🇴 Romania +40</option>
              <option value="+250">🇷🇼 Rwanda +250</option>
              <option value="+221">🇸🇳 Senegal +221</option>
              <option value="+381">🇷🇸 Serbia +381</option>
              <option value="+248">🇸🇨 Seychelles +248</option>
              <option value="+65">🇸🇬 Singapore +65</option>
              <option value="+421">🇸🇰 Slovakia +421</option>
              <option value="+386">🇸🇮 Slovenia +386</option>
              <option value="+27">🇿🇦 South Africa +27</option>
              <option value="+82">🇰🇷 South Korea +82</option>
              <option value="+34">🇪🇸 Spain +34</option>
              <option value="+94">🇱🇰 Sri Lanka +94</option>
              <option value="+1758">🇱🇨 St Lucia +1758</option>
              <option value="+249">🇸🇩 Sudan +249</option>
              <option value="+46">🇸🇪 Sweden +46</option>
              <option value="+41">🇨🇭 Switzerland +41</option>
              <option value="+886">🇹🇼 Taiwan +886</option>
              <option value="+255">🇹🇿 Tanzania +255</option>
              <option value="+228">🇹🇬 Togo +228</option>
              <option value="+1868">
                🇹🇹 Trinidad and Tobago +1868
              </option>
              <option value="+1649">
                🇹🇨 Turks and Caicos Islands +1649
              </option>
              <option value="+256">🇺🇬 Uganda +256</option>
              <option value="+971">
                🇦🇪 United Arab Emirates +971
              </option>
              <option value="+44">🇬🇧 United Kingdom +44</option>
              <option value="+1">🇺🇸 United States +1</option>
              <option value="+998">🇺🇿 Uzbekistan +998</option>
              <option value="+58">🇻🇪 Venezuela +58</option>*/}
                        </select>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.35rem",
                        }}
                    >
                        <label
                            style={{
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                color: "#1a202c",
                                ...formLabelStyles,
                            }}
                        >
                            {translate("phoneNumber", language, customText)}
                            <span style={{ color: "#FF0000" }}> *</span>
                        </label>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                                value={phoneNumber}
                                onChange={e =>
                                    setPhoneNumber(handlePhoneInput(e.target.value))
                                }
                                placeholder="555-555-5555"
                                style={{
                                    border: "1px solid #e2e8f0", // gray-300
                                    borderRadius: "0.375rem",
                                    padding: "0.5rem 0.75rem",
                                    width: "100%",
                                    ...formInputStyles,
                                }}
                            />
                        </div>

                        {displayName && (
                            <div style={{ marginTop: "0.25rem" }}>
                                {displayName == "required" ? (
                                    <label
                                        style={{
                                            fontSize: "0.875rem",
                                            fontWeight: "500",
                                            color: "#1a202c",
                                            ...formLabelStyles,
                                        }}
                                        htmlFor="name"
                                    >
                                        {translate("name", language, customText)}
                                        <span style={{ color: "#FF0000" }}> *</span>
                                    </label>
                                ) : (
                                    <label
                                        style={{ ...formLabelStyles }}
                                        htmlFor="name"
                                    >
                                        {translate("name", language, customText)}
                                    </label>
                                )}
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    placeholder={translate(
                                        "namePlaceholder",
                                        language,
                                        customText,
                                    )}
                                    onChange={e => setName(e.target.value)}
                                    style={{
                                        border: "1px solid #e2e8f0", // gray-300
                                        borderRadius: "0.375rem",
                                        padding: "0.5rem 0.25rem",
                                        width: "100%",
                                        marginBottom: "0.25rem",
                                        ...formInputStyles,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </form>
            )}

            {!enterCode && mfaSignIn && (
                <div>
                    <select
                        value={selectedHint}
                        onChange={e => setSelectedHint(e.target.value)}
                        style={{
                            border: "1px solid #e2e8f0", // gray-300
                            borderRadius: "0.375rem",
                            padding: "0.5rem 0.75rem",
                            width: "100%",
                        }}
                    >
                        {mfaResolver?.hints.map((hint, index) => (
                            <option value={index} key={index}>
                                xxx-xxx-{hint.phoneNumber?.slice(-4)}
                            </option>
                        ))}
                    </select>
                    <p>
                        {translate(
                            "confirmationTextWillBeSent",
                            language,
                            customText,
                        )}{" "}
                        {mfaResolver?.hints[selectedHint]?.phoneNumber?.slice(-4)}
                    </p>
                </div>
            )}
            {enterCode && (
                <>
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "end",
                        }}
                    >
                        <button
                            onClick={() => setSendSMS(false)}
                            style={{
                                fontSize: "0.875rem",
                                color: "#2b6cb0",
                                border: "none",
                                backgroundColor: "#fff",
                                cursor: "pointer",
                                ...formSmallButtonStyles,
                            }}
                        >
                            {translate("cancel", language, customText)}
                        </button>
                    </div>
                    <form style={{ display: "flex", gap: "0.5rem" }}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={e =>
                                    handleCodeChange(e.target.value, index)
                                }
                                onKeyDown={e => handleBackspace(e, index)}
                                style={{
                                    border: "1px solid #e2e8f0", // gray-300
                                    borderRadius: "0.375rem",
                                    padding: "0.5rem 0.75rem",
                                    width: "2.5rem", // Equivalent to w-10
                                }}
                            />
                        ))}
                    </form>
                </>
            )}
            <div id="recaptcha-container"></div>
            <button
                id="sign-in-button"
                onClick={handleButtonPress}
                style={{
                    color: "white",
                    fontWeight: "600",
                    marginTop: "1.25rem",
                    width: "100%",
                    height: "2.25rem",
                    alignItems: "center",
                    transition: "background-color 150ms",
                    backgroundColor: phoneNumberValid ? "#60a5fa" : "#9ca3af", // bg-blue-400 for valid, bg-gray-400 for invalid
                    cursor: phoneNumberValid ? "pointer" : "default", // cursor changes based on form validity
                    ...(phoneNumberValid
                        ? { ":hover": { backgroundColor: "#3b82f6" } }
                        : {}), // hover effect for valid form
                    display: "flex",
                    gap: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    justifyContent: "center",
                    border: "none",
                    ...formButtonStyles,
                    ...(phoneNumberValid ? {} : formDisabledStyles),
                }}
            >
        <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
          {enterCode
            ? translate("finishSigningIn", language, customText)
            : translate("sendText", language, customText)}
        </span>
            </button>
        </>
    );
}
