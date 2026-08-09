import com.pusher.rest.Pusher;
public class TestPusher {
    public static void main(String[] args) {
        try {
            Pusher pusher = new Pusher("2150188", "44efc7c3247e9a6efa2d", "52ac94e6e1f94a6323d7");
            pusher.setCluster("ap2");
            pusher.setEncrypted(true);
            pusher.trigger("job-1234", "new-message", "hello");
            System.out.println("Success");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
