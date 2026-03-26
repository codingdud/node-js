# Cleanup MongoDB Sharding Cluster

# Stop and remove all containers
docker stop mongos shard1 shard2 shard3 config1 config2 config3
docker rm mongos shard1 shard2 shard3 config1 config2 config3

# Remove network
docker network rm mongo-shard

Write-Host "Sharding cluster cleaned up!"


# ── STOP & REMOVE ALL CONTAINERS ─────────────────────────────
docker rm -f `
  config1 config2 config3 `
  shard1_1 shard1_2 shard1_3 `
  shard2_1 shard2_2 shard2_3 `
  shard3_1 shard3_2 shard3_3 `
  mongos

# ── REMOVE NETWORK ────────────────────────────────────────────
docker network rm mongo-shard

# ── REMOVE VOLUMES (optional — deletes all data) ─────────────
docker volume prune -f

Write-Host "✅ Cleanup Complete!"