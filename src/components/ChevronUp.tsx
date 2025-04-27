

const ChevronUp = ({ size = 24, ...props }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
};

export default ChevronUp;
