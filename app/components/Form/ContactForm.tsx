// Framework
import React, {useState, useEffect, useCallback, useRef} from "react";

// FontAwesome
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/pro-solid-svg-icons";

// Components
import Button from "../common/content/Button";

// Utils
import {useGoogleReCaptcha} from "react-google-recaptcha-v3";

export default function ContactForm() {

    const [contactNumber, setContactNumber] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [name, setName] = useState("");
    const recaptchaToken = useRef("");

    // Button text
    const [buttonText, setButtonText] = useState("Send");

    // Form validation
    const [errors, setErrors] = useState({});

    // User friendly messages
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showFailureMessage, setShowFailureMessage] = useState(false);

    // Google ReCaptcha
    const { executeRecaptcha } = useGoogleReCaptcha();

    // Generate a Google ReCaptcha token
    const handleReCaptchaVerify = useCallback(async () => {

        if (!executeRecaptcha) {
            console.log('Execute recaptcha not yet available');
            return;
        }

        recaptchaToken.current = await executeRecaptcha('contactForm');
    }, [executeRecaptcha]);

    // Classes
    const errorMessageClasses =
        "flex gap-1 items-center border border-red-200 bg-red-100 px-3 py-2 font-medium text-red-600 text-xs";
    const inputClasses = "border-gray-200 shadow-sm text-sm";
    const labelOuterClasses = "flex flex-col gap-2";
    const labelInnerClasses = "pl-1 font-medium text-sm";
    const successMessageClasses =
        "flex gap-1 items-center border border-green-300 bg-green-200 px-3 py-2 font-medium text-green-600 text-xs";

    const handleValidation = () => {
        let tempErrors = {};
        let isValid = true;

        if (contactNumber.length <= 0) {
            tempErrors["contactNumber"] = true;
            isValid = false;
        }

        if (email.length <= 0) {
            tempErrors["email"] = true;
            isValid = false;
        }

        if (message.length <= 0) {
            tempErrors["message"] = true;
            isValid = false;
        }

        if (name.length <= 0) {
            tempErrors["name"] = true;
            isValid = false;
        }

        setErrors({...tempErrors});

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValidForm = handleValidation();

        if (!isValidForm) return;

        await handleReCaptchaVerify();

        setButtonText("Sending");

        const res = await fetch("/api/form", {
            body: JSON.stringify({
                contactNumber,
                email,
                message,
                name,
                'recaptchaToken': recaptchaToken.current
            }),
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });

        const {error} = await res.json();

        if (error) {
            setShowSuccessMessage(false);
            setShowFailureMessage(true);
            setButtonText("Send");

            // Reset form fields
            setContactNumber("");
            setEmail("");
            setMessage("");
            setName("");
            return;
        }

        setShowSuccessMessage(true);
        setShowFailureMessage(false);
        setButtonText("Send");

        // Reset form fields
        setContactNumber("");
        setEmail("");
        setMessage("");
        setName("");

    };


    return (
        <>
            <form
                className="grid gap-6 xl:grid-cols-2"
                onSubmit={handleSubmit}
            >
                {showSuccessMessage && (
                    <div className="xl:col-span-2">
                        <div className={successMessageClasses}>
                            <span>
                                <FontAwesomeIcon icon={faCheckCircle}/>
                            </span>

                            <span>Thank you, your contact form submission has been sent.</span>
                        </div>
                    </div>
                )}

                {showFailureMessage && (
                    <div className="xl:col-span-2">
                        <div className={errorMessageClasses}>
                            <span>
                                <FontAwesomeIcon icon={faExclamationCircle}/>
                            </span>

                            <span>Something went wrong. Please try again</span>
                        </div>
                    </div>
                )}

                <div className="xl:col-span-2">
                    <label htmlFor="name" className={labelOuterClasses}>
                        <span className={labelInnerClasses}>Full Name</span>

                        <input
                            className={inputClasses}
                            name="name"
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            type="text"
                            value={name}
                        />

                        {errors?.name && (
                            <div className={errorMessageClasses}>
                                <span>
                                    <FontAwesomeIcon icon={faExclamationCircle}/>
                                </span>

                                <span>Please enter your name</span>
                            </div>
                        )}
                    </label>
                </div>

                <div>
                    <label htmlFor="email" className={labelOuterClasses}>
                        <span className={labelInnerClasses}>Email Address</span>

                        <input
                            className={inputClasses}
                            name="email"
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            type="email"
                            value={email}
                        />

                        {errors?.email && (
                            <div className={errorMessageClasses}>
                                <span>
                                    <FontAwesomeIcon icon={faExclamationCircle}/>
                                </span>

                                <span>Please enter your email</span>
                            </div>
                        )}
                    </label>
                </div>

                <div>
                    <label
                        htmlFor="contactNumber"
                        className={labelOuterClasses}
                    >
                        <span className={labelInnerClasses}>Contact Number</span>

                        <input
                            className={inputClasses}
                            name="contactNumber"
                            onChange={(e) => {
                                setContactNumber(e.target.value);
                            }}
                            type="tel"
                            value={contactNumber}
                        />

                        {errors?.contactNumber && (
                            <div className={errorMessageClasses}>
                                <span>
                                    <FontAwesomeIcon icon={faExclamationCircle}/>
                                </span>

                                <span>Please enter your contact number</span>
                            </div>
                        )}
                    </label>
                </div>

                <div className="xl:col-span-2">
                    <label htmlFor="message" className={labelOuterClasses}>
                        <span className={labelInnerClasses}>Your Message</span>

                        <textarea
                            className={inputClasses}
                            name="message"
                            onChange={(e) => {
                                setMessage(e.target.value);
                            }}
                            rows="6"
                            value={message}
                        ></textarea>

                        {errors?.message && (
                            <div className={errorMessageClasses}>
                                <span>
                                    <FontAwesomeIcon icon={faExclamationCircle}/>
                                </span>

                                <span>Please enter your message</span>
                            </div>
                        )}
                    </label>
                </div>

                <div className="xl:col-span-2">
                    <Button
                        colour="dark"
                        size="full"
                        text={buttonText}
                        type="submit"
                    />
                </div>
            </form>
        </>
    );
}
