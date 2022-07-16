import FewchaIcon from "public/svgs/fewcha.svg";
import MartianIcon from "public/svgs/martian.svg";
import HippoIcon from "public/svgs/hippo.svg";
import PontemIcon from "public/svgs/pontem.svg";
import CloseIcon from "public/svgs/close.svg";
const walletData = [
  { title: "Fewcha", icon: FewchaIcon },
  { title: "Martian", icon: MartianIcon },
  { title: "Hippo", icon: HippoIcon },
  { title: "Pontem", icon: PontemIcon },
];
const Wallet: React.FC<{ type: string; title: string; icon: any; isDetected: boolean }> = ({ title, icon, isDetected, type }) => {
  return (
    <div className={type === "grid" ? "bg-[#201E28] flex justify-center items-center border border-[#201E28] rounded-3xl" : "bg-[#201E28] flex justify-between items-center border border-[#201E28] rounded-3xl mx-6 py-4 px-4"}>
      <div className={type === "grid" ? "flex-col justify-center items-center p-[60px] space-y-2" : "flex items-center space-x-4"}>
        <div className={type === "grid" ? "flex justify-center items-center" : ""}>
          <img className={type === "grid" ? "w-[40px] h-[40px]" : "w-[36px] h-[36px]"} src={icon} alt="close" />
        </div>
        <div className="text-white text-[32px]">{title}</div>
      </div>
      {isDetected ? <div className="text-blue-500 text-[24px]">Detected</div> : <></>}
    </div>
  );
};
const Wallets: React.FC<{ type: string }> = ({ type }) => {
  const onShowWallets = (data: Array<any>) => {
    let result = null;
    if (data.length > 0) {
      result = data.map((item, index) => {
        return <Wallet type={type} key={index} title={item.title} icon={item.icon} isDetected={false} />;
      });
    }
    return result;
  };
  return (
    <section className="bg-[#050507] max-w-[532px] md:max-w-[532px] mx-auto border border-[#050507] rounded-3xl">
      <div className="bg-black flex justify-end my-[24px] mr-[24px]">
        <img src={CloseIcon} alt="close" />
      </div>
      <h1 className="text-white text-center py-[36px] px-[84px] text-[32px] font-bold lending-[38px]">Connet a wallet on Aptos to continue</h1>
      <div className={type === "grid" ? "mx-6 my-[40px] grid grid-cols-2 gap-4" : "my-[40px] flex-col space-y-4"}>{onShowWallets(walletData)}</div>
    </section>
  );
};
export default Wallets;
