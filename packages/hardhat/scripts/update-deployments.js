const fs = require('fs');
const path = require('path');

async function updateDeployments(network, addresses) {
  const deploymentsPath = path.join(__dirname, '..', 'deployments.json');
  
  // Read existing deployments
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
  }

  // Update network addresses
  if (!deployments.networks) {
    deployments.networks = {};
  }
  
  if (!deployments.networks[network]) {
    deployments.networks[network] = {
      description: `${network} network`,
      contracts: {}
    };
  }

  // Add deployment timestamp
  deployments.networks[network].deployedAt = new Date().toISOString();
  
  // Update contract addresses
  deployments.networks[network].contracts = {
    ...deployments.networks[network].contracts,
    ...addresses
  };

  // Write back to file
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  
  console.log(`✓ Updated deployments.json for network: ${network}`);
  console.log(`Contract addresses saved:`, Object.keys(addresses));
}

module.exports = { updateDeployments }; 