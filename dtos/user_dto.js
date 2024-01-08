module.exports = class UserDTO {
    email;
    id;
    role;
    isActivated;
    user_id;
    
    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.role = model.role;
        this.isActivated = model.isActivated;
        this.user_id = model.user_id;
    } 
}