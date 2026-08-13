exports.handler = async function () {
    try {
        const response = await fetch(
            "https://api.freetouse.com/v3/music/tracks/all?limit=20"
        );

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: "Failed to fetch songs"
                })
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};
