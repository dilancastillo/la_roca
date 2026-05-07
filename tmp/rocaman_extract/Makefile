######################################## BEFORE RUNNING THIS
#Delete RocaMan and user_api in backend_rocamanufacturing
#cp backend_rocamanufacturing/.env backend_rocamanufacturing/RocaMan
##############################################################
# Server configuration
USER=bitnami
SERVER=18.227.24.54
REMOTE_DIR=/home/bitnami/backend_manufacturing

# Deploy to server using SCP
.PHONY: deploy
deploy:
	@echo "adding the key"
	ssh-add /home/leonardo/transfer/awsFer/LightsailDefaultKey-us-east-2.pem
	@echo "Uploading RocaMan folder to $(USER)@$(SERVER):$(REMOTE_DIR)/RocaMan"

	scp RocaMan/*.py $(USER)@$(SERVER):$(REMOTE_DIR)/RocaMan

	@echo "Uploading user_api folder to $(USER)@$(SERVER):$(REMOTE_DIR)/user_api"

	scp -r user_api $(USER)@$(SERVER):$(REMOTE_DIR)
	scp -r RocaMan $(USER)@$(SERVER):$(REMOTE_DIR)

	@echo "Uploading requirements folder to $(USER)@$(SERVER):$(REMOTE_DIR)"
	scp requirements.txt $(USER)@$(SERVER):$(REMOTE_DIR)
	@echo "Deployment complete!"
########
#Restart the services
#sudo docker compose restart