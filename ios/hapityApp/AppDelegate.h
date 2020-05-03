#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>
@property (strong, nonatomic) UINavigationController *navController;

@property (nonatomic, strong) UIWindow *window;
- (void) goToNativeView;
@end

