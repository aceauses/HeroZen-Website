export async function deleteToken() {
    try {
        const response = await fetch("/secure/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        if (!response.ok) {
            console.error("Server response was not ok");
        }
        return true;
    } catch (error) {
        console.error("Error logging out:", error);
        return false;
    }
}
