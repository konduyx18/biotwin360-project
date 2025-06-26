import React from 'react';

const BoltBadge = ({ position = 'bottom-right', badgeType = 'black-circle' }) => {
  const badgeSrc = `/badges/badge-${badgeType}.svg`;

  return (
    <a 
      href="https://bolt.new/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`bolt-badge-container ${position}`}
    >
      <img src={badgeSrc} alt="Built with Bolt.new" className="bolt-badge-image" />
    </a>
  );
};

export default BoltBadge;